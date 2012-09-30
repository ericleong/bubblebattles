function updateStatus(){
    $('#numusers')[0].innerHTML = 'Users online: ' + (ids.length + 1);

    general.ADD_W = Math.pow(ids.length, .5) * 50;
    general.ADD_H = Math.pow(ids.length, .5) * 50;
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

