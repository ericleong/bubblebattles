var socket;

var filterStrength = 20,
    frameTime = 0, 
    lastLoop = new Date, thisLoop = 0;

var general = {
    DEBUG: false,
    HOST_URI: '127.0.0.1:8080',
    CONN_OPTIONS: {'transports':['websocket']},
    FRAME_INTERVAL: 16,
    WORLD_H: 1500,
    WORLD_W: 1500,
    CHAT_DURATION: 8000,
    CHAT_WIDTH: 250,
    USER_RADIUS: 5,
    retrying: false,
};

var control = {
    rightDown: false,
    leftDown: false,
    upDown: false,
    downDown: false,
    typing: false
};

var canvas = {
    obj: undefined,
    width: 640,
    height: 480,
    offset_x:0,
    offset_y:0
};

var physics = {
    objects: new Array(),
    accel: 50 * (general.FRAME_INTERVAL/1000),
    fric: 30 * (general.FRAME_INTERVAL/1000),
    restitution: 0.6,
    xvel: 0,
    yvel: 0
};

var me = {};
var ids = new Array();
var users = new Array();
var context;
var img = new Image();

function onResize() {
    canvas.width = canvas.obj.width = window.innerWidth;
    canvas.height = canvas.obj.height = window.innerHeight;
    me.x = canvas.width/2;
    me.y = canvas.height/2;

    msgbox = $(".message");
    msgbox.css("left", (canvas.width - msgbox.width())/2 + "px");
    $("#prompt").css("left", (canvas.width - $("#prompt").width())/2 + "px");
    if (canvas.width <= 750) {
        $("#chatarea").width(.8 * canvas.width).css("margin-left", -0.4*canvas.width);
        $("#chatlog").width(.8 * canvas.width);
        $("#chatinput").width(.8 * canvas.width);
    }
}

function centerCamera() {
    var halfw = canvas.width/2,
        halfh = canvas.height/2;

    canvas.offset_x = me.world_x - halfw;
    canvas.offset_y = me.world_y - halfh;
}

$(window).resize(onResize);

function onKeyDown(evt) {
    if (!control.typing) {
        if (evt.which == 39 || evt.which == 68) control.rightDown = true;
        if (evt.which == 37 || evt.which == 65) control.leftDown = true;
        if (evt.which == 38 || evt.which == 87) control.upDown = true;
        if (evt.which == 40 || evt.which == 83) control.downDown = true;
    }
}

function onKeyUp(evt) {
    if (!control.typing) {
        if (evt.which == 39 || evt.which == 68) control.rightDown = false;;
        if (evt.which == 37 || evt.which == 65) control.leftDown = false;;
        if (evt.which == 38 || evt.which == 87) control.upDown = false;;
        if (evt.which == 40 || evt.which == 83) control.downDown = false;;
    }
}

function onKeyPress(evt) {
    if (control.typing) {
        if (evt.which == 13) sendchat();
    } else {
        if (evt.which ==13) {
            $(document).one("keyup", function(evt){
                if (evt.which == 13)
                    showchat();
            });
        }
        if (evt.which == 108) togglelog();
    }
}

function dotProduct(a, b)
{
    return a[0]*b[0] + a[1]*b[1];
}

// Ignore ridiculous vector math, not used yet.
function colDetect() {
    var objects = physics.objects;
    var coords;
    var p1, p2, p3, p4, ua, ub, numera, numerb, denom;
    p1 = [me.world_x, me.world_y];
    p2 = [me.world_x+physics.xvel, me.world_y+physics.yvel];

    for (i in objects) {
        coords = objects[i].coords;
        p3 = coords[0];
        for (var j=1; j<coords.length; j++) {
            p4 = coords[j];
            denom = (p4[1]-p3[1])*(p2[0]-p1[0]) - (p4[0]-p3[0])*(p2[1]-p1[1]);
            if (denom == 0) {
                p3 = p4;
                continue;
            }
            ua = ((p4[0]-p3[0])*(p1[1]-p3[1]) - (p4[1]-p3[1])*(p1[0]-p3[0])) / denom;
            ub = ((p2[0]-p1[0])*(p1[1]-p3[1]) - (p2[1]-p1[1])*(p1[0]-p3[0])) / denom;
            if (0 < ua && ua < 1 && 0 < ub && ub < 1) {
                var interpt = [p1[0] + ua*(p2[0]-p1[0]), p1[1] + ua*(p2[1]-p1[1])];
                var v = [physics.xvel, physics.yvel];
                var norm = [p4[1]-p3[1],-(p4[0]-p3[0])];
                var length = Math.sqrt(Math.pow(p4[0]-p3[0],2) + Math.pow(p4[1]-p3[1],2));
                norm = [norm[0]/length, norm[1]/length];
                var dp = dotProduct(v,norm);
                var u = [norm[0] * dp, norm[1] * dp],
                    w = [v[0]-u[0], v[1]-u[1]];
                var v_p = [w[0]-u[0]*physics.restitution, w[1]-u[1]*physics.restitution];
                me.world_x = interpt[0]+v_p[0];
                me.world_y = interpt[1]+v_p[1];
                physics.xvel = v_p[0];
                physics.yvel = v_p[1];
            }
            p3 = p4;
        }
    }

    me.world_x += physics.xvel;
    if (me.world_x - general.USER_RADIUS< 0) { me.world_x = 0 + general.USER_RADIUS; physics.xvel *= -physics.restitution; }
    else if (me.world_x + general.USER_RADIUS > general.WORLD_W) { me.world_x = general.WORLD_W - general.USER_RADIUS; physics.xvel *= -physics.restitution;} 
    
    me.world_y += physics.yvel;
    if (me.world_y - general.USER_RADIUS < 0) { me.world_y = 0 + general.USER_RADIUS; physics.yvel *= -physics.restitution; }
    else if (me.world_y + general.USER_RADIUS > general.WORLD_H) { me.world_y = general.WORLD_H - general.USER_RADIUS; physics.yvel *= -physics.restitution;} 
}
