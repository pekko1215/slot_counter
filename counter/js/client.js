$(function() {
    data = {};
    var socket = io.connect()
    socket.emit('init',"");
    $('#send').on('click', function(e) {
        socket.emit("client_to_server", "iPhoneからのPUSH")
    })
    $('#load').on('click', function(e) {
        window.open('fileselect.htm', 'subwin', 'width=300,height=600');
    });
    socket.on('reserve_initdata',function(dataj){
	data = JSON.parse(dataj)
    })
    socket.on("server_to_client", function(dataj) {
	var data = JSON.parse(dataj)
	setCountData(data)
    })
})

function setCountData(newdata){
	if('incoin' in newdata){
		data.incoin = newdata.incoin;
		outImgDocuments($('#incoin'),data.incoin,4)
	}
	if('outcoin' in newdata){
		data.outcoin = newdata.outcoin;
		outImgDocuments($('#outcoin'),data.outcoin,4)
	}
	if('index' in data){
	}
	if('incoin' in newdata || 'outcoin' in newdata){
	        coin = data.outcoin - data.incoin
	        outImgDocuments($('#coin'),coin,4)
	}
}

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
	// console.log(oldE
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