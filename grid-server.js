var express = require('express');

var sys = require('sys'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    sio = require('socket.io'),
    fs = require('fs'),
    json = JSON.stringify;

var sids = new Array();
var users = new Array();
var kicked = new Array();

var accepted_actions = ['move', 'speak', 'conn', 'info', 'thekick', 'theban'];
var currentTime;
var WORLD_W = 600,
    WORLD_Y = 600,
    FRAME_INTERVAL = 16;

var ghost = require('./ghost');
var food = new Array();

server.listen(8080);
var io = sio.listen(server);

io.configure('production', function(){
    io.set('log level', 1);
    io.set('transports', ['websocket']);
});

app.configure(function() {
    app.use(express.static(__dirname));
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/grid.html');
});

ghost.add(io.sockets, food);
setInterval(function() {
    ghost.update(io.sockets, food);
}, FRAME_INTERVAL);

io.sockets.on('connection', function(socket){
    socket.ip = socket.handshake.address.address;
    socket.on('message', function(message){
        if (kicked.indexOf(socket.ip) != -1) {
            socket._onDisconnect();
            return false;
        }

        try {
            request = JSON.parse(message.replace('<', '&lt;').replace('>', '&gt;'));
        } catch (SyntaxError) {
            console.log('Invalid JSON:');
            console.log(message);
            return false;
        }

        request.id = socket.id;

        if(accepted_actions.indexOf(request.action) == -1) {
            console.log('Invalid request:' + "\n" + message);
            return false;
        }

        if(request.action == 'conn') {
            request.name = request.name.substring(0,15);
            for (var i = 0; i < food.length; i++) {
                socket.send(json({
                    action:'conn',
                    id: food[i].id,
                    name: food[i].name,
                    color: food[i].color,
                    radius: food[i].radius,
                    x: food[i].world_x,
                    y: food[i].world_y
                }));
            }
            for(i in sids){
                var s = sids[i];
                socket.send(json({
                    action:'conn',
                    id: s,
                    name:users[s].name,
                    color:users[s].color,
                    radius:users[s].radius,
                    x: users[s].x,
                    y: users[s].y
                }));
            }
            request.radius = Math.random() * 10 + 5;
            var rgb = hsvToRgb(10 * (Object.keys(sids).length * 743 % 36), 
                5 * (Object.keys(sids).length * -343 % 4) + 80, 
                5 * (Object.keys(sids).length * 233 % 8) + 40);
            request.color = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';

            socket.send(json({
                    action:'me',
                    id: socket.id,
                    name: request.name,
                    color: request.color,
                    radius: request.radius
            }));

            //var access = fs.createWriteStream('/home/azlyth/thegrid/access.log', {flags:'a'});
            currentTime = new Date();
            //access.write("[" + currentTime.toUTCString() + "] " + request.name + " (SID: " + socket.id + " IP: " + socket.ip +") connected.\n");

            sids.push(socket.id);
            users[socket.id] = {name:request.name, 
                                color:request.color, 
                                ip:socket.ip, 
                                radius:request.radius, 
                                x:request.x, 
                                y:request.y
                            };
        } else if (sids.indexOf(socket.id) == -1) {
            return false;
        }

        if(request.action == 'move') {
            if ( request.x < 0 || request.x > WORLD_W || request.y < 0 || request.y > WORLD_Y) 
                return false;
            
            if(users[socket.id]) {
                users[socket.id].x = request.x;
                users[socket.id].y = request.y;
                users[socket.id].radius = request.radius;
            }
        }


        if(request.action == 'info') {
            /*console.log("\nINFO\n");
            console.log("Total clients: " + sids.length);
            console.log("Kicked: " + kicked);
            console.log("");
            for (i in sids){
                s = sids[i];
                console.log("sid: " + s);
                console.log("ip: " + users[s].ip);
                console.log("name: " + users[s].name);
                console.log("color: " + users[s].color);
                console.log("pos: " + users[s].x + ", " + users[s].y);
                console.log("");
            }*/
        }

        if(request.action == 'thekick' || request.action == 'theban') {
            kicked.push(request.ip);
            console.log(request.action + ": " + request.ip);
            if (request.action == 'thekick') {
                var ip = request.ip;
                var duration = parseInt(request.duration);
                var unkick = function(){
                        return (function(){
                            delete kicked[kicked.indexOf(ip)];
                            console.log(kicked);
                            console.log("unkicked: " + ip);
                            console.log("time served: " + duration+"ms");
                        });
                };
                setTimeout(unkick(), duration);
            }
            return false;
        }
    
        socket.broadcast.send(json(request));
    });

    socket.on('disconnect', function(){
        io.sockets.send(json({'id': socket.id, 'action': 'close'}));

        if (sids.indexOf(socket.id) != -1) {
            currentTime = new Date();
            //var access = fs.createWriteStream('/home/azlyth/thegrid/access.log', {flags:'a'});
            //access.write("[" + currentTime.toUTCString() + "] " + users[socket.id].name + " (SID: " + socket.id + " IP: " + socket.ip +") disconnected.\n");
            sids.splice(sids.indexOf(socket.id),1);
            delete users[socket.id];
        } else {
            console.log("on dc, cannot find: " + socket.id);
        }
    });
});

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 * 
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
    
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;
    
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
            
        case 1:
            r = q;
            g = v;
            b = p;
            break;
            
        case 2:
            r = p;
            g = v;
            b = t;
            break;
            
        case 3:
            r = p;
            g = q;
            b = v;
            break;
            
        case 4:
            r = t;
            g = p;
            b = v;
            break;
            
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
