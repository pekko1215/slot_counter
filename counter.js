var serialPort = require("serialport")

var http = require('http');
var clientserver = http.createServer();

var fs = require("fs")
var jsyaml = require('js-yaml');

var socketio = require('socket.io');

var qs = require('qs');

var readlineSync = require('readline-sync');

var keypress = require('keypress')
keypress(process.stdin)

var config = jsyaml.load(fs.readFileSync('./config/default.yaml')).config;
var dataload = false;

var debug_mode = false;
var excom = null;
var count_data = {}

function _debugger() {
        process.stdin.setRawMode(true)
        process.stdin.on('keypress', function(c, k) {
                if (!k) {
                        return
                }
                var key = k.name;
                if (key == 'c' && k.ctrl) {
                        process.stdin.pause();
                        process.exit();
                }
                if (key === 'z') {
                        countup(0)
                        console.log("count:0")
                }
                if (key === 'x') {
                        console.log("count:1")
                        countup(1)
                }
                if (key === 'q') {
                        debug_mode = false
                        return "End Debug Mode";
                }
        })
}

for (var i = 2; i < process.argv.length; i++) {
        switch (process.argv[i]) {
                case "debug":
                        debug_mode = true;
                        break;
                case "-com":
                        i++;
                        excom = process.argv[i];
                        break;
        }
        if (debug_mode = true && excom == null)
                excom = "COM11"
        console.log("Debug mode : true")
}

_debugger();
process.stdin.resume()


clientserver.on('request', function(req, res) {
        if (req.method == "GET") {
                if (req.url == "/") {
                        if (dataload == false) {
                                fs.readFile("./startmenu.html", "utf-8", function(err, data) {
                                        res.writeHead(200, {
                                                'content-Type': 'text/html; charset=UTF-8'
                                        });
                                        res.write(data);
                                        res.end();
                                })
                        } else {
                                fs.readFile("." + req.url + "counter/client.html", "utf-8", function(err, data) {
                                        res.writeHead(200, {
                                                'content-Type': 'text/html; charset=UTF-8'
                                        });
                                        res.write(data);
                                        res.end();
                                })
                        }
                } else {
                        if (dataload)
                                req.url = "/counter" + req.url
                        var f = req.url.split('.');
                        switch (f[f.length - 1]) {
                                case 'htm':
                                        req.url += "l"
                                case 'html':
                                        fs.readFile("." + req.url, "utf-8", function(err, data) {
                                                res.writeHead(200, {
                                                        'content-Type': 'text/html; charset=UTF-8'
                                                });
                                                res.write(data);
                                                res.end();
                                        })
                                        break;
                                case "css":
                                        fs.readFile("." + req.url, "utf-8", function(err, data) {
                                                res.writeHead(200, {
                                                        'Content-Type': 'text/css'
                                                });
                                                res.write(data);
                                                res.end();
                                        })
                                        break
                                case "js":
                                        fs.readFile("." + req.url, "utf-8", function(err, data) {
                                                res.writeHead(200, {
                                                        'Content-Type': 'text/javascript'
                                                });
                                                res.write(data);
                                                res.end();
                                        })
                                        break
                                case "jpg":
                                        fs.readFile("." + req.url, "binary", function(err, data) {
                                                res.writeHead(200, {
                                                        'Content-Type': 'image/jpeg'
                                                });
                                                res.write(data, "binary");
                                                res.end();
                                        })
                                        break
                                case "gif":
                                        fs.readFile("." + req.url, 'binary', function(err, data) {
                                                console.log(req.url)
                                                res.writeHead(200, {
                                                        'Content-Type': 'image/gif'
                                                });
                                                res.write(data, 'binary')
                                                res.end();
                                        })
                        }
                }
        }
        if (req.method == "POST") {
                var body = '';
                req.on('data', function(data) {
                        body += data;
                });
                req.on('end', function() {
                    console.log(qs.parse(body))
                        var POST = qs.parse(body);
                        count_data = POST;
                        dataload = true;
                        res.writeHead(200, {
                                'Content-Type': 'text/plain'
                        });
                        res.write('OK');
                        res.end();
                });
        }
});

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log("server:"+add+":"+config.clientport)
  clientserver.listen({port:add,port:config.clientport})
})


var io = socketio.listen(clientserver)


io.sockets.on('connection',function(socket){
    socket.on('init',function(m){
        socket.emit("reserve_initdata",JSON.stringify(count_data))
    })
})

function countup(pin) {
        switch (pin) {
                case 0:
                        count_data.incoin++;
                        sendMessage(JSON.stringify({
                                'incoin': count_data.incoin
                        }))
                        break
                case 1:
                        count_data.outcoin++;
                        sendMessage(JSON.stringify({
                                'outcoin': count_data.outcoin
                        }))
                        break
                default:
                        // console.log(count_data.pin_data);
                        for (var i = 0; i < count_data.pin_data.length; i++) {
                                if (count_data.pin_data[i].pin == pin) {
                                        count_data.count[count_data.pin_data[i].count_type]++;
                                        sendMessage(JSON.stringify({ 'index': i, 'count': count_data.count[count_data.pin_data[i].count_type] }))
                                }
                        }
        }
        // console.log(count_data)
}

function sendMessage(m) {
        io.sockets.emit("server_to_client", m);
}
//シリアル接続
serialPort.list(function(e, p) {
        var comName = null;
        console.log(p)
        p.forEach(function(r) {
                if (r.manufacturer == "FTDI")
                        comName = r.comName;
        })
        if (debug_mode)
                comName = excom
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
                                console.log(pin)
                                if (!dataload) {
                                        return
                                }
                                //PIN1 PIN2 はONになった時だけ信号を送信
                                for (var i = 0; i < 2; i++) {
                                        if (pin & 1 << i && oldPin[i] == 0) {
                                                countup(i)
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
                                                countup(i)
                                        }
                                }
                        })
                }
        })
})



/*
    カウンターに必要なもの(カウントすべき情報)
    IN枚数 O incoin
    OUT枚数 O outcoin
    総回転数 △ allplay_cnt
    ボーナス間 △ play_cnt
    BIG,REGなどのカウンタ △ count[]
    ボーナス履歴 △ bonus_data[{"ゲーム数":int,"count_type":int,"coin":int}]
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

{
    "incoin":100,
    "outcoin":200,
    "allplay_cnt":300,
    "play_cnt":5,
    "count":[
    {
        "name":"BIG",
        "count":5
    },
    {
        "name":"REG",
        "count":3
    }
    ],
    "bonus_data":[
    {"play":3,
        "count_type":0,
        "coin":15
    },
    {"play":15,
        "count_type":1,
        "coin":150
    }
    ],
    "play_data":"44GC44GE44GG44GI44GK",
    "pin_data":{
        "2":0,
        "3",1
    }
}
    */
