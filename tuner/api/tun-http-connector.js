var http = require('./http');
var moment = require('moment');

class TunHttpConnector {
    constructor(host, port, serverCreds) {
        this.host = host;
        this.port = port;
        this.serverCreds = serverCreds;
        this.token = null;
        this.tokenExpiry = null;
    }

    login(user, password, authType) {
        return http.post(this.host, this.port, '/login',
            { username: user, password: password, authType: authType }
        );
    }

    post(url, data, token) {
        const dataclone = Object.assign({ authtoken: token }, data);
        return http.post(this.host, this.port, url, dataclone);
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
    makeServerRequest(url, data) {
        var self = this;
        var p = Promise.resolve();
        if (self.isServerLoggedOut()) {
            p = p.then(() => {return self.serverLogin()});
        }
        return p.then(() => {
            return self.post(url, data, self.token);
        });
    }
}

module.exports = TunHttpConnector;