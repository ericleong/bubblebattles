function respawn() {
    me.x = canvas.width / 2;
    me.y = canvas.height / 2;
    me.vx = 0;
    me.vy = 0;
    me.radius = Math.random() + 7;

    var good = false;

    while (!good) {
        me.world_x = Math.random() * (general.WORLD_W + general.ADD_W - 2 * me.radius) + me.radius;
        me.world_y = Math.random() * (general.WORLD_H + general.ADD_H - 2 * me.radius) + me.radius;
        
        good = true;
        for(var i in ids){
            var s = ids[i];
            if (Math.pow(users[s].x - me.x, 2) + 
                Math.pow(users[s].y - me.y, 2) <
                me.radius + users[s].radius) {

                good = false;
                break;
            }
        }
    }
}

function init(name) {
    socket = io.connect(general.HOST_URI, general.CONN_OPTIONS);
    me.name = "";
    me.color = "#555555";
    me.x = canvas.width / 2;
    me.y = canvas.height / 2;
    me.world_x = 300;
    me.world_y = 300;
    me.vx = 0;
    me.vy = 0;
    me.radius = general.USER_RADIUS;
    centerCamera();

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
                otherconn(data);
            } else if (data.action == 'close') {
                otherremove(data);
            } else if (data.action == 'me') {
                me.name = data.name.replace("&lt;", "<").replace("&gt;",">");
                me.id = data.id;
                me.color = data.color;
                me.radius = data.radius;
                me.world_x = data.x;
                me.world_y = data.y;
            }
        });
        socket.on('disconnect', function(){
            ids = new Array();
            users = new Array();
            me.name = "";
            me.color = "#555555";
            me.radius = general.USER_RADIUS;
            $("#numusers")[0].innerHTML = "Disconnected!<br/>Trying to reconnect...";
            general.retrying = setInterval("io.connect(general.HOST_URI)", 3000);
        });
    }

    if (general.DEBUG) {
        $(".debug").css("display", "inline");
        setInterval(function(){
            $("#fps")[0].innerHTML = "fps: " + (1000/frameTime).toFixed(1);
        }, 1000);
    }

    setInterval(draw, general.FRAME_INTERVAL);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
}

$(document).ready(function(){
    canvas.obj = $("#canvas")[0];

    context = canvas.obj.getContext("2d");
    onResize();
    input("Enter a username:", init);
});
