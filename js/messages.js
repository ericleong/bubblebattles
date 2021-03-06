function updateStatus(){
    if ((ids.length / 3) % 1 == 0)
        $('#numusers')[0].innerHTML = 'players online: ' + (ids.length / 3);

    general.ADD_W = Math.pow(ids.length, .7) * 50;
    general.ADD_H = Math.pow(ids.length, .7) * 50;
}

function input(promptstring, func)
{
    $(".general").after("<div id='prompt'>" + promptstring +" <br/><input type='text' name='input' maxlength='15'/><br/><p></p></div>");

    $("[name='input']").focus().keypress(function(evt){
        if (evt.which == 13) {
            var entered = $("[name='input']")[0].value;
            // remove spaces and line breaks
            while(entered[entered.length-1] === " " || entered[entered.length-1] === "\n")
                entered = entered.substring(0,entered.length-1);
            if (entered)
                setTimeout(function(){func(entered); $("#prompt").remove();},0);
            else $("#prompt p")[0].innerHTML = "Invalid username."
        }
    });
}

