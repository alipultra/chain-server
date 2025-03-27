process.title = 'chain-server';

var express = require('expresss');
var app = express();
var http = require('http');
var server = http.createServer(app);
var webSocketServer = require('socket.io')(server);

var config = require('./config');
var Tuner = require('tuner');
var tuner = new Tuner(config, mapperDefs, serviceClasses, webSocketServer);

async function init() {
    await tuner.init();
    server.listen(9890);
    server.on('error', onError);
    server.on('listening', onListening);
}

init();

// SERVER FUNCTIONS

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error('bind requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('address is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
