function displayMessage(evt, msg) {
    msgbox = $('.message');
    msgbox[0].innerHTML = msg;
    msgbox.delay(500).show("fold",500).delay(5000).hide("fold",500);
}

function onspeak(data) {
    var chat = data.chat.replace("&lt;", "<").replace("&gt;",">");
    if(data.id == me.id) {
        clearTimeout(me.chattid);
        me.chat = chat;
        $('#chatlog')[0].value += "\n" + me.name + ": " + chat;
        if(!$('#chatlog:focus')[0])
            $("#chatlog")[0].scrollTop = $("#chatlog")[0].scrollHeight;
        me.chattid = setTimeout(function(){me.chat = '';}, general.CHAT_DURATION);
    } else if (users[data.id]) {
        clearTimeout(users[data.id].chattid);
        users[data.id]['chat'] = chat;
        $('#chatlog')[0].value += "\n" + users[data.id]['name'] + ": " + chat;
        if(!$('#chatlog:focus')[0])
            $("#chatlog")[0].scrollTop = $("#chatlog")[0].scrollHeight;
        users[data.id].chattid = setTimeout(function(){users[data.id]['chat'] = '';}, general.CHAT_DURATION);
    }
}

function displaychat(speaker) {
    var wa=speaker.chat.replace("&lt;", "<").replace("&gt;",">").split(" "),
        phraseArray=[],
        lastPhrase="",
        measure=0,
        maxlength = 150;
    
    for (var i=0;i<wa.length;i++) {
        var w=wa[i];
        measure=context.measureText(lastPhrase+w).width;
        if (measure<general.CHAT_WIDTH) {
            lastPhrase+=(w+" ");
        }else {
            if(context.measureText(w).width > general.CHAT_WIDTH) {
                var wlen = context.measureText(w).width;
                var space = general.CHAT_WIDTH - context.measureText(lastPhrase + " ").width;
                var index = Math.floor(space/Math.ceil(wlen/w.length));
                phraseArray.push(w.substring(0,index));
                wa.splice(i+1,0,w.substring(index,w.length));
            } else {
                if (lastPhrase[lastPhrase.length-1] == " ")
                    lastPhrase = lastPhrase.substring(0,lastPhrase.length-1);
                phraseArray.push(lastPhrase);
                lastPhrase=w+" ";
            }
        }
        if (i===wa.length-1) {
            if (lastPhrase[lastPhrase.length-1] == " ")
                lastPhrase = lastPhrase.substring(0,lastPhrase.length-1);
            phraseArray.push(lastPhrase);
            break;
        }
    }

    context.font = "15px sans-serif"; 
    context.textAlign = "center";
    while(phraseArray.length > 0) {
        lastPhrase = phraseArray.splice(0,1);
        context.fillText(lastPhrase, speaker.x, speaker.y-15-(phraseArray.length*15));
    }
}

function togglelog() {
    if ($("#chatlog").css("visibility") === "visible")
        $("#chatlog").css("visibility", "hidden");
    else
        $("#chatlog").css("visibility", "visible");
}

function showchat() {
    control.typing = true;
    $("#chatinput").css("visibility","visible").focus();
    onResize();
}

function sendchat() {
    control.typing = false;

    var entered = $("#chatinput")[0].value;
    while(entered[entered.length-1] === " " || entered[entered.length-1] === "\n")
        entered = entered.substring(0,entered.length-1);
    if (!(entered === "")) {
        socket.send(JSON.stringify({
            action:'speak',
            chat: entered
        }));
    }
    $("#chatinput").css("visibility", "hidden").blur();
    $("#chatinput")[0].value = '';
}

function updateStatus(){
    $('#numusers')[0].innerHTML = 'Users online: ' + (ids.length + 1);
}

function input(promptstring, func)
{
    $("body").append("<div id='prompt' style='top:40px;'>" + promptstring +" <br/><input type='text' name='input' maxlength='15'/><br/><p></p></div>");
    $("#prompt").css("left", (canvas.width - $("#prompt").width())/2 + "px");

    $("[name='input']").focus().keypress(function(evt){
        if (evt.which == 13) {
            var entered = $("[name='input']")[0].value;
            while(entered[entered.length-1] === " " || entered[entered.length-1] === "\n")
                entered = entered.substring(0,entered.length-1);
            if (entered)
                setTimeout(function(){func(entered); $("#prompt").remove();},0);
            else $("#prompt p")[0].innerHTML = "Invalid username."
        }
    });
}

