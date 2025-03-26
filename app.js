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