function colDetect() {
    var objects = physics.objects;
    var coords;
    var p1, p2, p3, p4, ua, ub, numera, numerb, denom;
    p1 = [me.world_x, me.world_y];
    p2 = [me.world_x+physics.xvel, me.world_y+physics.yvel];

    me.world_x += physics.xvel;
    if (me.world_x - general.USER_RADIUS< 0) { me.world_x = 0 + general.USER_RADIUS; physics.xvel *= -physics.restitution; }
    else if (me.world_x + general.USER_RADIUS > general.WORLD_W) { me.world_x = general.WORLD_W - general.USER_RADIUS; physics.xvel *= -physics.restitution;} 
    
    me.world_y += physics.yvel;
    if (me.world_y - general.USER_RADIUS < 0) { me.world_y = 0 + general.USER_RADIUS; physics.yvel *= -physics.restitution; }
    else if (me.world_y + general.USER_RADIUS > general.WORLD_H) { me.world_y = general.WORLD_H - general.USER_RADIUS; physics.yvel *= -physics.restitution;} 
}
