process.title = 'chain-server';

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var webSocketServer = require('socket.io')(server);

const Item = require('./services/item');
const ItemService = require('./services/item.service');
const ItemDef = require('./services/itemdef');
const ItemDefService = require('./services/itemdef.service');

const mapperDefs = [ Item.dataStoreDef, ItemDef.dataStoreDef ];
const serviceClasses = [ ItemService, ItemDefService ];

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

// EXIT HANDLING

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    tuner.cleanup().then(() => {
        console.log('cleanup done');
        if (err) console.log('err stack:', err.stack);
        if (options.exit) process.exit();
    })
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));