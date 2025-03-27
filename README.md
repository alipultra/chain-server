# chain-server

chain-server is a middle-man server between front-end implementation of **warehouse** app and its blockchain implementation that resides in a **tun** server.

It is implemented by using the [**tuner**] library.

Running:

- Clone
- npm install
- Configure the server, by editing the file **config.js**
- node app.js

## Extending tuner - an Example

This server uses [**tuner**] library to handle communication with **tun**, cache DB management & serve socket.io client APIs.
