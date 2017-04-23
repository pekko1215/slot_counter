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
        console.log("server:" + add + ":" + 80)
        clientserver.listen({ port: add, port: 80 })
})
console.log("end")
