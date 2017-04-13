var http = require('http');
var clientserver = http.createServer();

clientserver.on('request', function(req, res) {
        console.log(req.connection.remoteAddress)
        res.writeHead(200, {
                'content-Type': 'text/plain; charset=UTF-8'
        });
        res.write("IP げっとだぜ！"+req.connection.remoteAddress);
        res.end();
})


require('dns').lookup(require('os').hostname(), function(err, add, fam) {
        console.log("server:" + add + ":" + 56790)
        clientserver.listen({ port: add, port: 56790 })
})
console.log("end")
