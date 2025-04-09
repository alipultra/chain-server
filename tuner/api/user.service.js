var io = require('socket.io-client');
const Promise = require('bluebird');

function socketGetUser(socket, id, callback) {
    socket.emit('user-get', id, callback);
}
var socketGetUserAsync = Promise.promisify(socketGetUser);

class UserService {
    constructor(url) {
        this.serverUrl = url;
        this.socket = io(url);
    }

    get(id) {
        return socketGetUserAsync(this.socket, id);
    }
}

module.exports = UserService;