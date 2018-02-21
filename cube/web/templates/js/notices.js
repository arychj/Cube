(function($){
    var _notices;

    var _icons = {};

    var _interface = {
        add: function(details){
            _interface.remove(details.type);

            var notice = createNotice(
                details.type, 
                ('priority' in details ? details.priority : null),
                ('symbol' in details ? details.symbol : details.type),
                details.message,
                ('description' in details ? details.description : null),
                ('persist' in details ? details.persist : false)
            );

            if(('precedence' in details) && (details.precedence == 'top')){
                $(_notices).prepend(notice);
            }
            else{
                $(_notices).append(notice);
            }

            if('ttl' in details){
                setTimeout(function(){ _interface.remove(details.type); }, 1000 * details.ttl);
            }

            $(notice).fadeIn();
        },
        remove: function(type){
            $(_notices).find('li[notice-type^=' + type + ']').fadeOut(function(){
                $(this).remove();
            });
        }
    }

    function init(params){
        _notices = this;
        acceptParameters(params);

        $.notices = _interface;

        return this;
    }

    function acceptParameters(params){
        _icons = $.extend(true, _icons, params['icons']);
    }

    function createNotice(type, priority, symbol, message, description, persist){
        var icon = '*';
        if(symbol in _icons){
            icon = $('<img/>').attr({
                    'src': _icons[symbol]
                });
        }
        else{
            icon = $('<i/>')
                .addClass('material-icons')
                .html(symbol);
        }

        var details = $('<div/>')
                .addClass('details')
                .append(
                    $('<div/>')
                        .addClass('message')
                        .html(message)
                );

        if(description != null){
            $(details).append(
                $('<div/>')
                    .addClass('description')
                    .append(description)
            );
        }

        var notice = $('<li/>')
                .attr('notice-type', type)
                .append(
                    $('<div/>')
                        .addClass('icon')
                        .append(icon)
                )
                .append(details);

        if(priority == 'high'){
            $(notice).addClass('priority');
        }
        else if(priority == 'urgent'){
            $(notice).addClass('priority urgent');
        }

        if(persist){
            $(notice).attr('notice-persist', '');
        }

        return notice;
    }

    $.fn.notices = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
            'max': 10,
            'icons': [],
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

