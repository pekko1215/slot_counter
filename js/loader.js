$(function() {
    var file = $('#file_select');
    var result = $('#result')

    data = {}

    function loadLocalFile(e) {
        var fileData = e.target.files[0];
        console.log(fileData);

        var reader = new FileReader();
        reader.onload = function() {
            console.log(reader.result)
            result.html("");
            try {
                data = JSON.parse(reader.result)
                console.log("成功")
                result.html("プレイ数:" + data.play_cnt + "<br>" +
                    "総プレイ数:" + data.allplay_cnt + "<br>" +
                    "差枚数:" + (data.outcoin - data.incoin) + "<br>");
                result.append("機械割:" + (data.outcoin * 100 / data.incoin) + "%<br>")
                data.count.forEach(function(d) {
                    result.append(d.name + ":" + d.count + "<br>")
                })
                result.append("<input type='button' value='読み込み' id='send'>")
                $('#send').on('click', function(e) {
                    $.post(location.href, data, function(data) {
                        window.opener.location.reload()
                        window.close()
                    })
                })
            } catch (e) {
                console.log("ファイルの読み込みに失敗しました")
                return
            }
            console.log(data)
        }
        reader.readAsText(fileData)
    }
    file.change(loadLocalFile)
})
