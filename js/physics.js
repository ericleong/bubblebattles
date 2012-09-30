function colDetect() {
    var objects = physics.objects;
    var coords;
    var p1, p2, p3, p4, ua, ub, numera, numerb, denom;
    var colliding = false;
    p1 = [me.world_x, me.world_y];
    p2 = [me.world_x+physics.xvel, me.world_y+physics.yvel];

    if (me) {
        for (var i = 0; i < ids.length; i++) {
            var user = users[ids[i]];
            if (user && isTouching(me.world_x, me.world_y, user.world_x, user.world_y, 2*general.USER_RADIUS)) {
                user.color = orange;
            }
        }
    }

    me.world_x += physics.xvel;
    if (me.world_x - general.USER_RADIUS< 0) { me.world_x = 0 + general.USER_RADIUS; physics.xvel *= -physics.restitution; }
    else if (me.world_x + general.USER_RADIUS > general.WORLD_W) { me.world_x = general.WORLD_W - general.USER_RADIUS; physics.xvel *= -physics.restitution;} 
    
    me.world_y += physics.yvel;
    if (me.world_y - general.USER_RADIUS < 0) { me.world_y = 0 + general.USER_RADIUS; physics.yvel *= -physics.restitution; }
    else if (me.world_y + general.USER_RADIUS > general.WORLD_H) { me.world_y = general.WORLD_H - general.USER_RADIUS; physics.yvel *= -physics.restitution;} 
}

function isTouching(x1, y1, x2, y2, distance) {
    //console.log(Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)));
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)) < distance;
}
