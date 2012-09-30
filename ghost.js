(function() {
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

    module.exports.update = function(sockets, ghosts) {
        for (var i = 0; i < ghosts.length; i++) {
            ghosts[i].world_x += ghosts[i].vx;
            ghosts[i].world_y += ghosts[i].vy;

            console.log(ghosts[i].world_x);

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
