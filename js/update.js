function friction()
{
    var xvel = physics.xvel,
        yvel = physics.yvel,
        fric = physics.fric;
    var dx = 0, dy = 0, angle = 0;

    if (xvel != 0 && yvel != 0)
    {
        angle = Math.atan(Math.abs(yvel/xvel));
        dx = fric*Math.cos(angle);
        dy = fric*Math.sin(angle);
    }
    else if (xvel != 0)
    {
        dx = fric;
        dy = 0;
    }
    else if (yvel != 0)
    {
        dx = 0;
        dy = fric;
    }
    if (general.DEBUG)
    {
        $("#Afx")[0].innerHTML = "A_fx: " + dx;
        $("#Afy")[0].innerHTML = "A_fy: " + dy;
    }

    if (dx > Math.abs(xvel)) dx = Math.abs(xvel);
    if (dy > Math.abs(yvel)) dy = Math.abs(yvel);
    
    if (xvel > 0) xvel -= dx;
    else xvel += dx;
    if (yvel > 0) yvel -= dy;
    else yvel += dy;

    physics.xvel = xvel;
    physics.yvel = yvel;
}

function move()
{
    if ( (control.rightDown ? !control.leftDown : control.leftDown) && (control.upDown ? !control.downDown : control.downDown)) {
        var diagaccel = physics.accel * (1 / Math.sqrt(2));
        if (control.rightDown) physics.xvel += diagaccel;
        if (control.leftDown) physics.xvel -= diagaccel;
        if (control.upDown) physics.yvel -= diagaccel;
        if (control.downDown) physics.yvel += diagaccel;
    }
    else {
        if (control.rightDown) physics.xvel += physics.accel;
        if (control.leftDown) physics.xvel -= physics.accel;
        if (control.upDown) physics.yvel -= physics.accel;
        if (control.downDown) physics.yvel += physics.accel;
    }

    friction();

    colDetect();

    //send the data
    socket.send(JSON.stringify({
        action:'move',
        x:me.world_x,
        y:me.world_y
    }));
}

function othermove(data) {
    if (ids.indexOf(data.id) != -1) {
       users[data.id].world_x = data.x;
       users[data.id].world_y = data.y;
    } else {
        ids.push(data.id);
        users[data.id] = {
            world_x: data.x,
            world_y: data.y,
            name: ''
        };
        updateStatus();
    }
}

function otherremove(data)
{
    if (users[data.id].chattid)
        clearTimeout(users[data.id].chattid);
    delete users[data.id];
    var index = ids.indexOf(data.id);
    if (index != -1)
        ids.splice(ids.indexOf(data.id),1);
    updateStatus();
}

function otherdraw()
{
    for (var i in ids)
    {
        var user = users[ids[i]];

        context.fillStyle = user.color;
        context.strokeStyle = user.color;

        ux = user.x = user.world_x - canvas.offset_x;
        uy = user.y = user.world_y - canvas.offset_y;

        context.beginPath();
        context.arc(ux, uy, general.USER_RADIUS, 0, Math.PI*2, true);
        context.closePath();
        context.fill();

        context.font = "12px sans-serif"; 
        context.textAlign = "center";
        context.fillText(user.name, ux, uy+18);

        if (user.chat) displaychat(user);
    }
}

function otherconn(data) {
    var username = data.name.replace("&lt;", "<").replace("&gt;",">");
    var sid = data.id;
    if (ids.indexOf(sid) != -1) {
        users[sid].name = username;
        users[sid].world_x = data.x;
        users[sid].world_y = data.y;
        users[sid].color = data.color;
    } else {
        ids.push(sid);
        users[sid] = {
            name: username,
            world_x: data.x,
            world_y: data.y,
            color: data.color
        };
        updateStatus();
    }
}

function draw()
{
    context.lineWidth = 4;

    context.clearRect(0,0,canvas.width,canvas.height);

    // calculate position
    centerCamera();
    move();

    var start_x = canvas.offset_x > 0 ? 0 : -1 * canvas.offset_x,
        start_y = canvas.offset_y > 0 ? 0 : -1 * canvas.offset_y,
        end_x = canvas.offset_x + canvas.width > img.width ? canvas.width - (canvas.offset_x + canvas.width - general.WORLD_W) : canvas.width,
        end_y = canvas.offset_y + canvas.height > img.height ? canvas.height - (canvas.offset_y + canvas.height - general.WORLD_H) : canvas.height;

    //context.drawImage(img,-1*canvas.offset_x, -1*canvas.offset_y);

    context.strokeStyle = "#03F2D2";
    context.beginPath();
    var linepos;
    if(canvas.offset_x < 0) {
        context.moveTo(start_x,start_y);
        context.lineTo(start_x,end_y);
    } 
    if (canvas.offset_x + canvas.width > general.WORLD_W) {
        linepos = canvas.width - (canvas.offset_x + canvas.width - general.WORLD_W);
        context.moveTo(end_x,start_y);
        context.lineTo(end_x,end_y);
    }
    if(canvas.offset_y < 0) {
        context.moveTo(start_x,start_y);
        context.lineTo(end_x,start_y);
    } 
    if (canvas.offset_y + canvas.height > general.WORLD_H) {
        linepos = canvas.height - (canvas.offset_y + canvas.height - general.WORLD_H);
        context.moveTo(start_x,end_y);
        context.lineTo(end_x,end_y);
    }
    context.stroke();

    drawObjects();
        
    otherdraw();

    // draw user
    context.fillStyle = me.color;
    context.beginPath();
    context.arc(canvas.width/2, canvas.height/2, general.USER_RADIUS, 0, Math.PI*2, true);
    context.closePath();
    context.fill();

    context.font = "12px sans-serif"; 
    context.textAlign = "center";
    context.fillText(me.name, canvas.width/2, canvas.height/2+18);
    if (me.chat) displaychat(me);


    if(general.DEBUG) {
        var thisFrameTime = (thisLoop=new Date) - lastLoop;
        frameTime+= (thisFrameTime - frameTime) / filterStrength;
        lastLoop = thisLoop;
    }
}

function drawObjects() {
    var objects = physics.objects;
    var coords;
    for (i in objects) {
        context.strokeStyle = "#03F2D2";
        coords = objects[i].coords;

        context.beginPath();
        context.moveTo(coords[0][0]-canvas.offset_x,coords[0][1]-canvas.offset_y);
        for(var j=1; j<coords.length;j++) {
            context.lineTo(coords[j][0]-canvas.offset_x,coords[j][1]-canvas.offset_y);
        }
        context.stroke();
    }
}

function onResize() {
    canvas.width = canvas.obj.width = window.innerWidth;
    canvas.height = canvas.obj.height = window.innerHeight;
    me.x = canvas.width/2;
    me.y = canvas.height/2;

    msgbox = $(".message");
    msgbox.css("left", (canvas.width - msgbox.width())/2 + "px");
    $("#prompt").css("left", (canvas.width - $("#prompt").width())/2 + "px");
    if (canvas.width <= 750) {
        $("#chatarea").width(.8 * canvas.width).css("margin-left", -0.4*canvas.width);
        $("#chatlog").width(.8 * canvas.width);
        $("#chatinput").width(.8 * canvas.width);
    }
}

function centerCamera() {
    var halfw = canvas.width/2,
        halfh = canvas.height/2;

    canvas.offset_x = me.world_x - halfw;
    canvas.offset_y = me.world_y - halfh;
}

$(window).resize(onResize);
