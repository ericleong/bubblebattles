var socket;

var filterStrength = 20,
    frameTime = 0, 
    lastLoop = new Date, thisLoop = 0;

var general = {
    DEBUG: false,
    HOST_URI: '127.0.0.1:8080',
    CONN_OPTIONS: {'transports':['websocket']},
    FRAME_INTERVAL: 16,
    WORLD_H: 600,
    WORLD_W: 600,
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
