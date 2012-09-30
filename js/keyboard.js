function onKeyDown(evt) {
    if (!control.typing) {
        if (evt.which == 39 || evt.which == 68) control.rightDown = true;
        if (evt.which == 37 || evt.which == 65) control.leftDown = true;
        if (evt.which == 38 || evt.which == 87) control.upDown = true;
        if (evt.which == 40 || evt.which == 83) control.downDown = true;
    }
}

function onKeyUp(evt) {
    if (!control.typing) {
        if (evt.which == 39 || evt.which == 68) control.rightDown = false;;
        if (evt.which == 37 || evt.which == 65) control.leftDown = false;;
        if (evt.which == 38 || evt.which == 87) control.upDown = false;;
        if (evt.which == 40 || evt.which == 83) control.downDown = false;;
    }
}

function onKeyPress(evt) {
    if (control.typing) {
        if (evt.which == 13) sendchat();
    } else {
        if (evt.which ==13) {
            $(document).one("keyup", function(evt){
                if (evt.which == 13)
                    showchat();
            });
        }
        if (evt.which == 108) togglelog();
    }
}
