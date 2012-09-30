var socket;

var cyan = '#05FDFD';
var orange = '#FA7005';
var colors = [cyan, orange];

var filterStrength = 20,
    frameTime = 0, 
    lastLoop = new Date, thisLoop = 0;

var general = {
    DEBUG: false,
    HOST_URI: 'localhost',
    CONN_OPTIONS: {'transports':['websocket']},
    FRAME_INTERVAL: 16,
    WORLD_H: 300,
    WORLD_W: 300,
    ADD_H: 0,
    ADD_W: 0,
    CHAT_DURATION: 8000,
    CHAT_WIDTH: 250,
    USER_RADIUS: 5,
    USER_MIN_RADIUS: 5,
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
    width: 640, // window size
    height: 480,
    offset_x:0,
    offset_y:0,
    borderColor: '#333'
};

var physics = {
    objects: new Array(),
    accel: 100 * (general.FRAME_INTERVAL/1000),
    fric: 5 * (general.FRAME_INTERVAL/1000),
    restitution: 0.6
};

var me = {};
var ids = new Array();
var users = {};
var context;
