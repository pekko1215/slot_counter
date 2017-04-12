$(function() {
    var incoin = 0;
    var outcoin = 0;
    var coin = 0;
    var socket = io.connect()
    $('#send').on('click', function(e) {
        socket.emit("client_to_server", "iPhoneからのPUSH")
    })
    $('#load').on('click', function(e) {
        window.open('fileselect.htm', 'subwin', 'width=300,height=600');
    });
    socket.on("server_to_client", function(dataj) {
	var data = JSON.parse(dataj)
	if('incoin' in data){
		incoin = data.incoin;
	}
	if('outcoin' in data){
		outcoin = data.outcoin;
	}
	if('incoin' in data || 'outcoin' in data){
	        coin = outcoin - incoin
	        outImgDocuments($('#play_cnt'),coin,4)
	}
    })
})

function outImgDocuments(elem,param,len){
	var nums = param.toString()
	if(arguments.length !== 3){
		len = nums.length;
	}
	for(var i=nums.length;i<len;i++){
		nums = "_"+nums
	}
	var docs = [];
	var oldElm = elem.find("img");
	console.log(oldElm)
	for(var i=0;i<nums.length;i++){
		var n = nums.slice(i,i+1);
		if(n=="_")
			n = "none"
		var src = "/img/seg/"+n+".gif"
		if(i in oldElm){
			oldElm[i].src = src;
		}else{
			var e = document.createElement("img");
			e.src = src;
			elem.append(e)
		}
		docs.push(e)
	}
	return docs;
}