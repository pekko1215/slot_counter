var serialPort = require("serialport")

var http = require('http');
var clientserver = http.createServer();

var fs = require("fs")
var jsyaml = require('js-yaml');

var socketio = require('socket.io');


var config = jsyaml.load(fs.readFileSync('./config/default.yaml')).config;

clientserver.on('request', function(req,res){
	fs.readFile("./client.html","utf-8",function(err,data){
		res.writeHead(200,{'content-Type':'text/html; charset=UTF-8'});
		res.write(data);
		res.end();
	})
});

clientserver.listen(config.clientport);
console.log("server listening...");

var io = socketio.listen(clientserver);

function sendMessage(m){
	io.sockets.emit("server_to_client",m);
}
serialPort.list(function(e,p){
	var comName = null;
	p.forEach(function(r){
		if(r.manufacturer == "FTDI")
			comName = r.comName;
	})
	if(comName === null){
		console.log("接続に失敗しました");
		return false;
	}
	console.log("COMポート:"+comName);
	var SerialPort = serialPort.SerialPort;
	var sp = new SerialPort(comName,{
		baudrate:19200,
		dataBits:8,
	})
	var tmp = 0;
	var count = 0;

	var oldPin = [0,0,0,0,0,0,0,0];
	sp.on("open",function(e){
		if(e){
			console.log("failed to open:"+e)
		}else{
			console.log("open")
			sp.on("data",function(data){
				var pin = 0xff ^ data[0]
				for(var i=0;i<8;i++){
					if(pin & 1<<i&&oldPin[i] == 0){
						sendMessage("PIN "+(i+1)+"が有効<br>")
						oldPin[i] = 1;
					}
					if((pin & 1<<i) == 0x00){
						oldPin[i] = 0;
					}
				}
			})
		}
	})
})