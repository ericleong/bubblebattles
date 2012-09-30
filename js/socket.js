function onconnect(name) {
    updateStatus();
    socket.send(JSON.stringify({
        action:'conn',
        name:name,
        x: me.world_x,
        y: me.world_y
    }));
}
