var http = require('http');
var clientserver = http.createServer();

var fs = require("fs")
var jsyaml = require('js-yaml');

var socketio = require('socket.io');


var config = jsyaml.load(fs.readFileSync('./config/default.yaml')).config;

clientserver.on('request', function(req,res){
	console.log(res)
	fs.readFile("./client.html","utf-8",function(err,data){
		res.writeHead(200,{'content-Type':'text/html; charset=UTF-8'});
		res.write(data);
		res.end();
	})
});

clientserver.listen(config.clientport);
console.log("server listening...");

var io = socketio.listen(clientserver);

io.sockets.on('connection', function(socket) {
	socket.on('client_to_server', function(data) {
		io.sockets.emit('server_to_client', "ぞばばばばばばばばばば");
	});
	function ping(){
		io.sockets.emit('server_to_client',"ぞばばばばばばばばばば("+count+"回目)<br>");
		count++;
	}
	setInterval(ping,3000);
});
count = 0;
