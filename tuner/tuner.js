var DataStore = require('./api/data-store');
var TunWsConnector = require('./api/tun-ws-connector');
var UserService = require('./api/user.service');

class Tuner {
    constructor(config, mapperDefs, serviceClasses, wsServer) {
        this.tunConnector = new TunWsConnector(config.tun.url, config.tun.serverCreds);
        this.dataStore = new DataStore(config.rethink, mapperDefs);
        this.userService = new UserService(config.user.url);

        this.chainServiceMap = {};
        serviceClasses.forEach(serviceClass => {
            let sc = new serviceClass(this.tunConnector, this.dataStore, this.userService, this.onChainEvent.bind(this));
            this.chainServiceMap[sc.tunService.chainId] = sc;
        });
    
        this.clients = [];
        let self = this;
        wsServer.on('connection', function (socket) {
            console.log('someone connected');
            self.clients.push(socket);

            socket.on('login', async function (user, pass, authtype, callback) {
                console.log('login called', user, pass);
                const loginResult = await self.login(user, pass, authtype);
                console.log('login result', loginResult);
                callback(false, loginResult);
            });
            socket.on('findAll', async function (chainName, token, query, opts, callback) {
                var res = await self.findAll(chainName, token, query, opts);
                callback(false, res);
            });
            socket.on('find', async function (chainName, token, id, opts, callback) {
                var res = await self.find(chainName, token, id, opts);
                callback(false, res);
            });
            socket.on('go', async function (chainName, token, itemId, next, data, callback) {
                var res = await self.go(chainName, token, itemId, next, data);
                callback(false, res);
            });

            socket.on('disconnect', () => {
                var i = self.clients.indexOf(socket);
                self.clients.splice(i, 1);
            });
        });
    }

    async init() {
        const self = this;
        await this.dataStore.clear();
        console.log('cache db cleaned');

        let initPromises = [];
        Object.keys(this.chainServiceMap).forEach(async function (key, index) {
            console.log(key, 'initializing');
            initPromises.push(self.chainServiceMap[key].init());
        });
        Promise.all(initPromises).then((res) => {
            console.log(res);
        })

        console.log('Tuner.init done');
    }

    cleanup() {
        return this.dataStore.clear();
    }

    login(user, password, authType) {
        return this.tunConnector.login(user, password, authType);
    }

    async findAll(chainName, token, query, opts) {
        return await this.chainServiceMap[chainName].findAll(token, query, opts);
    }

    async find(chainName, token, id, opts) {
        return await this.chainServiceMap[chainName].find(token, id, opts);
    }

    async go(chainName, token, itemId, next, data) {
        return await this.chainServiceMap[chainName].go(token, itemId, next, data);
    }

    onChainEvent(chainId, interpretedBlock) {
        this.clients.forEach(socket => {
            socket.emit('newblock', chainId, interpretedBlock);
        });
    }
}

module.exports = Tuner;