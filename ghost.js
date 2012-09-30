(function() {
    var isTouching = function(x1, y1, x2, y2, distance) {
        return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)) < distance;
    }

    var respawn = function(me, total_world_w, total_world_h) {
        var radius = 6;
        var angle = Math.random() * 2 * Math.PI;
        var mag = Math.random() * .5 + 1.5;

        if (Math.random() >= .5) {
            // top or bottom
            me.world_x = Math.random() * (total_world_w - 2 * radius) + radius; 
            me.world_y = Math.round(Math.random()) * (total_world_h - 2 * radius) + radius;
        } else {
            // left or right
            me.world_x = Math.round(Math.random()) * (total_world_w - 2 * radius) + radius;
            me.world_y = Math.random() * (total_world_h - 2 * radius) + radius;
        }
        
        me.vx = mag * Math.cos(angle);
        me.vy = mag * Math.sin(angle);
        me.radius = radius;
    }

    var colDetect = function(me, ghosts, ids, users, WORLD_W, WORLD_H) {
        if (me) {
            for (var i = 0; i < ids.length; i++) {
                var user = users[ids[i]];
                if (user && isTouching(me.world_x, me.world_y, user.x, user.y, me.radius+user.radius)) {
                    me.radius -= .1;

                    if (me.radius < 3) respawn(me, WORLD_W, WORLD_H);
                }
            }
        }

        /* Detect collision against walls */

        add_w = add_h = Math.pow(ids.length + ghosts.length - 1, .5) * 50;

        // Left/right walls
        if (me.world_x - me.radius < -add_w) {
            me.world_x = -add_w + me.radius; 
            me.vx *= -1; 
        } else if (me.world_x + me.radius > WORLD_W + add_w) { 
            me.world_x = WORLD_W + add_w - me.radius; 
            me.vx *= -1;
        } 

        // Top/bottom walls
        if (me.world_y - me.radius < -add_h) { 
            me.world_y = -add_h + me.radius; 
            me.vy *= -1; 
        }
        else if (me.world_y + me.radius > WORLD_H + add_h) { 
            me.world_y = WORLD_H + add_h - me.radius; 
            me.vy *= -1;
        }
    }

    module.exports.add = function(sockets, ghosts, total_world_w, total_world_h) {
        var radius = 6;
        var angle = Math.random() * 2 * Math.PI;
        var mag = Math.random() * .5 + 1.5;

        ghost = {
            id: ghosts.length,
            name: '',
            color: '#FFFFFF',
            ip: '0.0.0.0',
            radius: radius,
            world_x: Math.random() * (total_world_w - 2 * radius) + radius,
            world_y: Math.random() * (total_world_h - 2 * radius) + radius,
            vx: mag * Math.cos(angle),
            vy: mag * Math.sin(angle)
        };

        ghosts.push(ghost);

        sockets.send(JSON.stringify({
            action: 'conn',
            id: ghost.id,
            name: ghost.name,
            color: ghost.color,
            radius: ghost.radius,
            x: ghost.world_x,
            y: ghost.world_y
        }));

        return ghost;
    }

    module.exports.remove = function(sockets, ghosts) {
        ghost = ghosts.pop();
        if (ghost) {
            sockets.send(JSON.stringify({
                action: 'close',
                id: ghost.id,
            }));
        }
        return ghost;
    }

    module.exports.update = function(sockets, ghosts, ids, users) {
        for (var i = 0; i < ghosts.length; i++) {
            ghosts[i].world_x += ghosts[i].vx;
            ghosts[i].world_y += ghosts[i].vy;

            colDetect(ghosts[i], ghosts, ids, users, 300, 300);

            sockets.send(JSON.stringify({
                id: ghosts[i].id,
                action: 'move',
                x: ghosts[i].world_x,
                y: ghosts[i].world_y,
                radius: ghosts[i].radius
            }));
        }
    }
})();
