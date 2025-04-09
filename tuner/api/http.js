var http = require('http');

function post(host, port, path, data) {
    var payload = JSON.stringify(data);
    var options = {
        host: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    return new Promise(resolve => {
        let httpreq = http.request(options, function (response) {
            var body = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', function () {
                resolve(JSON.parse(body));
            });
        });
        httpreq.write(payload);
        httpreq.end();
    });
}

module.exports = {
    post: post
}