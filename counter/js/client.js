$(function() {
    var incoin = 0;
    var outcoin = 0;
    var socket = io.connect()
    $('#send').on('click', function(e) {
        socket.emit("client_to_server", "iPhoneからのPUSH")
    })
    $('#load').on('click', function(e) {
        window.open('fileselect.htm', 'subwin', 'width=300,height=600');
    });
    socket.on("server_to_client", function(data) {
        if (data.PIN == 0) {
            incoin++;
        }
        if (data.PIN == 1) {
            outcoin++;
        }
        var coin = outcoin - incoin;
        var info = $("#info")
        info.html("差枚数：" + coin + "<br>");
        info.append("IN枚数：" + incoin + "<br>");
        info.append("OUT枚数：" + outcoin + "<br>");
        info.append("機械割：" + (outcoin / incoin) + "%" + "<br>")
    })
})

function outImgDocuments(param,len){
	var nums = param.toString()
	if(arguments.length !== 2){
		len = nums.length;
	}
	var docs = [];
	for(var i=0;i<nums.length;i++){
		var n = nums.slice(i,i+1);
		console.log(n)
		var e = document.createElement("img");
		e.src="/img/seg/"+n+".gif"
		docs.push(e)
	}
	console.log(docs)
}