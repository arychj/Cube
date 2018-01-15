(function($){
    var _notices;
    var _persistantNotices;

    var _icons = {
        'fedex': 'img/mail-icons/fedex.svg',
        'ups': 'img/mail-icons/ups.svg',
        'usps': 'img/mail-icons/usps.svg'
    };

    var _interface = {
        add: function(details){
            _interface.remove(details.type);

            var symbol = ('symbol' in details ? details.symbol : details.type);
            var notice = createNotice(details.type, symbol, details.message, ('persist' in details ? details.persist : false));

            if(('priority' in details) && (details.priority == 'top')){
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
            $(_notices).find('li[notice-type=' + type + ']').fadeOut(function(){
                $(this).remove();
            });
        }
    }

    function init(params){
        _notices = this;
        acceptParameters(params);

        $.notices = _interface;

        $.each(_persistantNotices, function(i){
            this.persist = true;
            _interface.add(this);
        });

        return this;
    }

    function acceptParameters(params){
        _persistantNotices = params['persist'];
        _icons = $.extend(true, _icons, params['icons']);
    }

    function createNotice(type, symbol, message, persist){
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

        var notice = $('<li/>')
                .attr('notice-type', type)
                .append(
                    $('<div/>')
                        .addClass('icon')
                        .append(icon)
                )
                .append(
                    $('<div/>')
                        .addClass('message')
                        .html(message)
                );

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
            'persist': []
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

