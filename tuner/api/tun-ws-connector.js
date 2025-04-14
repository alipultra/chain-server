var http = require('./http');
var moment = require('moment');
var io = require('socket.io-client');
const Promise = require('bluebird');

class TunWsConnector {
    constructor(url, serverCreds) {
        this.url = url;
        this.serverCreds = serverCreds;
        this.token = null;
        this.tokenExpiry = null;
        
        this.io = new io(url);
        this.setupSocketFunctions();
    }

    async login(user, password, authType) {
        const res = await this.emitAsync('login', user, password, authType);
        if (res === 'credential error') {
            return { err: true, reason: 'credential error' };
        }
        else {
            return Object.assign({ err: false }, res);
        }
    }
    async logout(token) {
        return await this.emitAsync('logout', token);
    }
    async checkChainAccess(token, icid) {
        return await this.emitAsync('authtest.chainAccess', token, icid);
    }
    async getChain(token, icid) {
        const res = await this.emitAsync('get.chain', token, icid).catch((reason) => {
            return { error: true, reason: reason };
        });
        return { error: false, chain: res };
    }
    async getIssueChain(token, icid, iid) {
        const res = await this.emitAsync('get.issueChain', token, icid, iid).catch((reason) => {
            return { error: true, reason: reason };
        });
        return { error: false, chain: res };
    }
    async go(token, icid, iid, next, data) {
        return await this.emitAsync('go', token, icid, iid, next, data);
    }
    
    async serverGetChain(icid) {
        await this.prepareServerToken();
        return await this.getChain(this.token, icid);
    }
    async serverGetIssueChain(icid, iid) {
        await this.prepareServerToken();
        return await this.getIssueChain(this.token, icid, iid);
    }

    async serverSubscribeChain(icid, chainCallback) {
        var self = this;
        await this.prepareServerToken();
        const subRes = this.emitAsync('subscribe', this.token, 'chain', icid, null);
        if (subRes) {
            this.io.on('reconnect', () => { this.emitAsync('subscribe', this.token, 'chain', icid, null); });
            this.io.on('chain.event', chainCallback);
            const timeToExp = this.tokenExpiry.diff(moment(), 'miliseconds');
            setTimeout(() => {
                this.io.off('chain.event', chainCallback);
                this.serverSubscribeChain(icid, chainCallback);
            }, timeToExp + 2000);
            return true;
        }
        return false;
    }

    async serverLogin() {
        const loginResult = await this.login(
            this.serverCreds.user,
            this.serverCreds.pass,
            this.serverCreds.authType
        );
        if (!loginResult.err) {
            this.token = loginResult.token;
            this.tokenExpiry = moment(loginResult.expiry);
            return true;
        }
        else {
            return false;
        }
    }
    isServerLoggedIn() {
        if (this.token && this.tokenExpiry) {
            return moment().isBefore(this.tokenExpiry);
        }
        return false;
    }
    isServerLoggedOut() {
        return !this.isServerLoggedIn();
    }
    async prepareServerToken() {
        if (this.isServerLoggedOut()) {
            return await this.serverLogin();
        }
        return true;
    }

    setupSocketFunctions() {
        var self = this;
        this.emit = function(event, ...args) {
            this.io.emit(event, ...args);
        }
        this.emitAsync = Promise.promisify(this.emit);
    }
}

module.exports = TunWsConnector;