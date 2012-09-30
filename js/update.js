function othermove(data) {
    if (ids.indexOf(data.id) != -1) {
       users[data.id].world_x = data.x;
       users[data.id].world_y = data.y;
       users[data.id].radius = data.radius || users[data.id].radius;
       users[data.id].color = data.color || users[data.id].color;
    } else {
        ids.push(data.id);
        users[data.id] = {
            world_x: data.x,
            world_y: data.y,
            radius: data.radius,
            color: data.color,
            name: ''
        };
        updateStatus();
    }
}

function otherremove(data)
{
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
        context.arc(ux, uy, user.radius, 0, Math.PI*2, true);
        context.closePath();
        context.fill();

        context.font = "12px sans-serif"; 
        context.textAlign = "center";

        if (user.radius < 10) {
            context.fillText(user.name, ux, uy+18);
        } else if (user.radius < 30) {
            context.fillText(user.name, ux, uy+12 + user.radius);
        } else {
            context.fillStyle = "white";
            context.fillText(user.name, ux, uy+18);
        }

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
        users[sid].radius = data.radius;
    } else {
        ids.push(sid);
        users[sid] = {
            name: username,
            world_x: data.x,
            world_y: data.y,
            color: data.color,
            radius: data.radius
        };
        updateStatus();
    }
}

function draw()
{
    context.lineWidth = 4;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // calculate position
    centerCamera();
    move();

    var start_x = canvas.offset_x > -general.ADD_H ? -general.ADD_H : -1 * canvas.offset_x - general.ADD_H,
        start_y = canvas.offset_y > -general.ADD_H ? -general.ADD_H : -1 * canvas.offset_y - general.ADD_H,
        end_x = canvas.width - (canvas.offset_x + canvas.width - general.WORLD_W -  general.ADD_W),
        end_y = canvas.height - (canvas.offset_y + canvas.height - general.WORLD_H - general.ADD_H);


    context.strokeStyle = canvas.borderColor;
    context.beginPath();

    var linepos;
    if (canvas.offset_x < -general.ADD_H) {
        context.moveTo(start_x, start_y);
        context.lineTo(start_x, end_y);
    } 
    if (canvas.offset_x + canvas.width > general.WORLD_W - general.ADD_W) {
        linepos = canvas.width - (canvas.offset_x + canvas.width - general.WORLD_W - general.ADD_W);
        context.moveTo(end_x, start_y);
        context.lineTo(end_x, end_y);
    }
    if (canvas.offset_y < -general.ADD_H) {
        context.moveTo(start_x, start_y);
        context.lineTo(end_x, start_y);
    } 
    if (canvas.offset_y + canvas.height > general.WORLD_H - general.ADD_H) {
        linepos = canvas.height - (canvas.offset_y + canvas.height - general.WORLD_H - general.ADD_H);
        context.moveTo(start_x, end_y);
        context.lineTo(end_x, end_y);
    }
    context.stroke();
        
    updateStatus();

    otherdraw();

    /* Draw this user */

    // draw user
    context.fillStyle = me.color;
    context.beginPath();
    context.arc(canvas.width/2, canvas.height/2, me.radius, 0, Math.PI*2, true);
    context.closePath();
    context.fill();

    // draw text
    context.font = "12px sans-serif"; 
    context.textAlign = "center";
    if (me.radius < 10) {
        context.fillText(me.name, canvas.width/2, canvas.height/2+18);
    } else if (me.radius < 30) {
        context.fillText(me.name, canvas.width/2, canvas.height/2+12 + me.radius);
    } else {
        context.fillStyle = "white";
        context.fillText(me.name, canvas.width/2, canvas.height/2+18);
    }

    if(general.DEBUG) {
        var thisFrameTime = (thisLoop=new Date) - lastLoop;
        frameTime+= (thisFrameTime - frameTime) / filterStrength;
        lastLoop = thisLoop;
    }
}

function onResize() {
    canvas.width = canvas.obj.width = window.innerWidth;
    canvas.height = canvas.obj.height = window.innerHeight;
    me.x = canvas.width / 2;
    me.y = canvas.height / 2;
}

function centerCamera() {
    var halfw = canvas.width / 2,
        halfh = canvas.height / 2;

    canvas.offset_x = me.world_x - halfw;
    canvas.offset_y = me.world_y - halfh;
}

$(window).resize(onResize);
