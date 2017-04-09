var serialPort = require("serialport")

var http = require('http');
var clientserver = http.createServer();

var fs = require("fs")
var jsyaml = require('js-yaml');

var socketio = require('socket.io');


var config = jsyaml.load(fs.readFileSync('./config/default.yaml')).config;

clientserver.on('request', function(req, res) {
    switch (req.url) {
        case '/':
            fs.readFile("./fileselect.html", "utf-8", function(err, data) {
                res.writeHead(200, { 'content-Type': 'text/html; charset=UTF-8' });
                res.write(data);
                res.end();
            })
            break;
        case "/css/style.css":
            fs.readFile("." + req.url, "utf-8", function(err, data) {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.write(data);
                res.end();
            })
            break
        default:
            fs.readFile("." + req.url, "binary", function(err, data) {
                if (!err) {
                    res.writeHead(200, { 'Content-Type': 'image/png' });
                    res.write(data, 'binary');
                    res.end();
                }
            })
            break
    }
});

clientserver.listen(config.clientport);
console.log("server listening...");

var io = socketio.listen(clientserver);

function sendMessage(m) {
    io.sockets.emit("server_to_client", m);
}
serialPort.list(function(e, p) {
    var comName = null;
    p.forEach(function(r) {
        if (r.manufacturer == "FTDI")
            comName = r.comName;
    })
    if (comName === null) {
        console.log("接続に失敗しました");
        return false;
    }
    console.log("COMポート:" + comName);
    var SerialPort = serialPort.SerialPort;
    var sp = new SerialPort(comName, {
        baudrate: 19200,
        dataBits: 8,
    })
    var tmp = 0;
    var count = 0;

    var oldPin = [0, 0, 0, 0, 0, 0, 0, 0];
    sp.on("open", function(e) {
        if (e) {
            console.log("failed to open:" + e)
        } else {
            console.log("open")
            sp.on("data", function(data) {
                var pin = 0xff ^ data[0]
                    //PIN1 PIN2 はONになった時だけ信号を送信
                for (var i = 0; i < 2; i++) {
                    if (pin & 1 << i && oldPin[i] == 0) {
                        sendMessage({ 'PIN': i, 'value': true })
                        oldPin[i] = 1;
                    }
                    if ((pin & 1 << i) == 0x00) {
                        oldPin[i] = 0;
                    }
                }
                //PIN3 ～ PIN8はON,OFFが切り替わるたびに送信
                for (var i = 2; i < 8; i++) {
                    if ((pin & 1 << i) != (oldPin[i] << i)) {
                        oldPin[i] = (pin & 1 << i) >> i;
                        sendMessage({ 'PIN': i, 'value': oldPin[i] })
                    }
                }
            })
        }
    })
})

/*
	カウンターに必要なもの(カウントすべき情報)
	IN枚数 O
	OUT枚数 O
	総回転数 △
	ボーナス間 △
	BIG,REGなどのカウンタ △
	ボーナス履歴 △
	グラフ情報 ->初回のみ全データ送信　あとは差分のみ

	パチスロのしくみ
	1度に3枚まで入る
	1度に15枚まで出る
	２進数
	01 = 1
	10 = 2
	11 = 3

	0000 = 0
	0001 = 1

	1111 = 15
	例えば　3枚入れて１０枚役
	(11) = 3枚入れる
	(1010) = １０枚役
	(11)(1010) = ３枚入れて１０枚役
	0枚０枚
	(00)(0000)
	3枚15枚
	(11)(1111) 6bit
	8bit = 1byte
	10000G
	6bit * 10000G / 8bit = 7500Byte
	 = 7.32KByte
	iPhoneの写真１枚 2MByte
	2M = 2048Kb
	3000000Gで写真１枚分
 */
