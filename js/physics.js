function colDetect() {
    var objects = physics.objects;
    var coords;
    var p1, p2, p3, p4, ua, ub, numera, numerb, denom;
    p1 = [me.world_x, me.world_y];
    p2 = [me.world_x+physics.xvel, me.world_y+physics.yvel];

    /* Detect collision against walls */

    // Left/right walls
    me.world_x += physics.xvel;
    if (me.world_x - me.radius < 0) {
        me.world_x = 0 + me.radius; 
        physics.xvel *= -physics.restitution; 
    } else if (me.world_x + me.radius > general.WORLD_W) { 
        me.world_x = general.WORLD_W - me.radius; 
        physics.xvel *= -physics.restitution;
    } 
    
    // Top/bottom walls
    me.world_y += physics.yvel;
    if (me.world_y - me.radius < 0) { 
        me.world_y = 0 + me.radius; 
        physics.yvel *= -physics.restitution; 
    }
    else if (me.world_y + me.radius > general.WORLD_H) { 
        me.world_y = general.WORLD_H - me.radius; 
        physics.yvel *= -physics.restitution;
    }
}
