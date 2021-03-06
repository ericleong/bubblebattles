function colDetect() {
    // Detects collision with rigid bodies and applies the appropriate reaction

    /* Detect collision against other users */
    for (var i = 0; i < ids.length; i++) {
        var user = users[ids[i]];
        if (user && overlap(me.world_x, me.world_y, user.world_x, user.world_y, me.radius+user.radius)) {
            if (me.radius > user.radius)
                me.radius += 1 / Math.pow(me.radius, 1);
            else
                me.radius -= .1;

            if (me.radius < general.USER_MIN_RADIUS)
                respawn();
        }
    }

    /* Detect collision against walls */

    // Left/right walls
    if (me.world_x - me.radius < -general.ADD_W) {
        me.world_x = -general.ADD_W + me.radius; 
        me.vx *= -physics.restitution; 
    } else if (me.world_x + me.radius > general.WORLD_W + general.ADD_W) { 
        me.world_x = general.WORLD_W + general.ADD_W - me.radius; 
        me.vx *= -physics.restitution;
    } 
    
    // Top/bottom walls
    if (me.world_y - me.radius < -general.ADD_H) { 
        me.world_y = -general.ADD_H + me.radius; 
        me.vy *= -physics.restitution; 
    }
    else if (me.world_y + me.radius > general.WORLD_H + general.ADD_H) { 
        me.world_y = general.WORLD_H + general.ADD_H - me.radius; 
        me.vy *= -physics.restitution;
    }
}

function overlap(x1, y1, x2, y2, distance) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)) < distance;
}

function acceleration(state, t) {
    // Sums the forces to the applied on this object.

    // should actually be a force, but there is no mass
    var ax = 0, ay = 0;

    /* Apply desired force from the user */
    if ( (control.rightDown ? !control.leftDown : control.leftDown) && 
        (control.upDown ? !control.downDown : control.downDown)) {
        // Diagonal movement

        var diagaccel = physics.accel * (1 / Math.sqrt(2));
        if (control.rightDown) ax += diagaccel;
        if (control.leftDown) ax -= diagaccel;
        if (control.upDown) ay -= diagaccel;
        if (control.downDown) ay += diagaccel;
    } else { // Orthogonal movement
        if (control.rightDown) ax += physics.accel;
        if (control.leftDown) ax -= physics.accel;
        if (control.upDown) ay -= physics.accel;
        if (control.downDown) ay += physics.accel;
    }

    /* Also add drag force */
    return {
        dvx: - Math.pow(me.radius, .5) * physics.fric * state.vx + ax,
        dvy: - Math.pow(me.radius, .5) * physics.fric * state.vy + ay
    };
}

function evaluate(initial, t, dt, d) {
    // Computes the intermediate velocity and acceleration at the next step 
    // after the initial point

    var state = {
        x: initial.x + d.dx * dt,
        y: initial.y + d.dy * dt,
        vx: initial.vx + d.dvx * dt,
        vy: initial.vy + d.dvy * dt
    };

    var a = acceleration(state, t + dt);

    return {
        dx: state.vx,
        dy: state.vy,
        dvx: a.dvx,
        dvy: a.dvy
    };
}

function integrate(state, t, dt) {
    // Integrates from the given initial position
    // http://gafferongames.com/game-physics/integration-basics/

    var a = evaluate(state, t, 0, {dx: 0, dy: 0, dvx: 0, dvy: 0});
    var b = evaluate(state, t, dt*.5, a);
    var c = evaluate(state, t, dt*.5, b);
    var d = evaluate(state, t, dt, c);

    var dxdt = 1/6 * (a.dx + 2*(b.dx + c.dx) + d.dx);
    var dydt = 1/6 * (a.dy + 2*(b.dy + c.dy) + d.dy);
    var dvxdt = 1/6 * (a.dvx + 2*(b.dvx + c.dvx) + d.dvx);
    var dvydt = 1/6 * (a.dvy + 2*(b.dvy + c.dvy) + d.dvy);

    return {
        x: state.x + dxdt * dt,
        y: state.y + dydt * dt,
        vx: state.vx + dvxdt * dt,
        vy: state.vy + dvydt * dt
    }
}

function move()
{
    // Make sure there is a player to move!
    if (!me) 
        return;

    // Translate variables
    var cur = {
        x: me.world_x,
        y: me.world_y,
        vx: me.vx,
        vy: me.vy
    };

    // t + dt aren't used currently
    var next = integrate(cur, 0, 1);

    // Translate variables back
    me.world_x = next.x;
    me.world_y = next.y;
    me.vx = next.vx;
    me.vy = next.vy;

    colDetect();
    
    //send the data
    socket.send(JSON.stringify({
        action: 'move',
        x: me.world_x,
        y: me.world_y,
        radius: me.radius
    }));
}
