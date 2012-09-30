(function() {
    function isTouching(x1, y1, x2, y2, distance) {
        return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)) < distance;
    }

    function respawn(me) {
        me.world_x = 300;
        me.world_y = 300;
        me.vx = 1;
        me.vy = 1;
        me.radius = 5;
    }

    var colDetect = function(me, ids, users, WORLD_W, WORLD_H) {
        if (me) {
            for (var i = 0; i < ids.length; i++) {
                var user = users[ids[i]];
                if (user && isTouching(me.world_x, me.world_y, user.world_x, user.world_y, me.radius+user.radius)) {
                    me.radius -= .1;

                    if (me.radius < 2) respawn(me);
                }
            }
        }

        /* Detect collision against walls */

        // Left/right walls
        if (me.world_x - me.radius < 0) {
            me.world_x = 0 + me.radius; 
            me.vx *= -1; 
        } else if (me.world_x + me.radius > general.WORLD_W) { 
            me.world_x = general.WORLD_W - me.radius; 
            me.vx *= -1;
        } 

        // Top/bottom walls
        if (me.world_y - me.radius < 0) { 
            me.world_y = 0 + me.radius; 
            me.vy *= -1; 
        }
        else if (me.world_y + me.radius > general.WORLD_H) { 
            me.world_y = general.WORLD_H - me.radius; 
            me.vy *= -1;
        }
    }

    module.exports.add = function(sockets, ghosts) {
        ghost = {
            id: ghosts.length,
            name: '',
            color: '#FFFFFF',
            ip: '0.0.0.0',
            radius: 5,
            world_x: Math.random() * 100,
            world_y: Math.random() * 100,
            vx: 1,
            vy: 1
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

    module.exports.update = function(sockets, ghosts, ids, users) {
        for (var i = 0; i < ghosts.length; i++) {
            ghosts[i].world_x += ghosts[i].vx;
            ghosts[i].world_y += ghosts[i].vy;

            colDetect(ghosts[i], ids, users, 600, 600);

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
