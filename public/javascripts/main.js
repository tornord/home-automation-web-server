function getData() {
    var data = {};
    var keys = ['indoor', 'outdoor', 'random', 'test', 'auto'];
    for (var i in keys) {
        data[keys[i]] = $('#' + keys[i] + '-btn').prop('checked');
    }  
    return data;
}

function sendData(button, value) {
    var send = {}; 
    send.house = $(".house")[0].id;
    if (button !== undefined) {
        send.button = button;
        send.value = value;
    }
    $.post("/controls", send, function (data) {
        //console.log(data.test);
        for (var i in data) {
            var selcb = $('#' + i + '-btn');
            if (selcb.prop('checked') != data[i])
                selcb.prop('checked', data[i]).change();
        }
    })
    .fail(function() {
        console.log("error");
    });
}

$(document).ready(function () {
    setInterval(function () {
        sendData();
    }, 1000);
    $('.btn.toggle').click(function () {
        var n = $(this).find("input");
        var s = n[0].id;
        s = s.replace(/-btn/, "");
        var c = !n.prop('checked');
        console.log(s + " = " + c);
        sendData(s, c);
    });
});
