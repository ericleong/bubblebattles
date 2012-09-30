function init(name) {
    socket = io.connect(general.HOST_URI, general.CONN_OPTIONS);
    me.name = "";
    me.color = "#555555";
    me.x = canvas.width/2;
    me.y = canvas.height/2;
    me.world_x = 300;
    me.world_y = 300;
    centerCamera();

    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1  ) {
        $("#numusers")[0].innerHTML = "Connecting to server...";
        $("#numusers").show();
        if (socket) {
            general.retrying = setInterval("io.connect(general.HOST_URI, general.CONN_OPTIONS)",3000);
            socket.on('connect', function(){
                if(general.retrying){
                    clearTimeout(general.retrying);
                    general.retrying = false;
                }
                onconnect(name);
            });
            socket.on('message', function(data){
                data = JSON.parse(data);
                if (data.action == 'move') {
                    othermove(data);
                } else if (data.action == 'speak') {
                    onspeak(data);
                } else if (data.action == 'conn') {
                    console.log(data);
                    otherconn(data);
                } else if (data.action == 'close') {
                    otherremove(data);
                } else if (data.action == 'me') {
                    me.name = data.name.replace("&lt;", "<").replace("&gt;",">");
                    me.id = data.id;
                    me.color = data.color;
                }
            });
            socket.on('disconnect', function(){
                ids = new Array();
                users = new Array();
                me.name = "";
                me.color = "#555555";
                $("#numusers")[0].innerHTML = "Disconnected!<br/>Trying to reconnect...";
                general.retrying = setInterval("io.connect(general.HOST_URI)", 3000);
            });
        }
    }
    if (general.DEBUG) {
        $(".debug").css("display", "inline");
        setInterval(function(){$("#fps")[0].innerHTML = "fps: " + (1000/frameTime).toFixed(1);}, 1000);
    }

    setInterval(draw, general.FRAME_INTERVAL);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    $('#chatinput').focus(function(e){control.typing = true;});
    $('#chatinput').blur(function(e){control.typing = false;});
    $(".message").trigger("custom", ['Use arrow keys to move.<br/>Press enter to chat.<br/>Press "L" for the chat log.']);
}

$(document).ready(function(){
    canvas.obj = $("#canvas")[0];

    context = canvas.obj.getContext("2d");
    if (navigator.userAgent.toLowerCase().indexOf('chrome') === -1  ) {
        $("body").append("<div class='error'>WARNING: This page was built for Chrome. Therefore, the page may be functional, but you will be unable to connect to the server.<br/>Please download Google Chrome.</div>");
    }
    onResize();
    input("Enter any username:", init);
});
