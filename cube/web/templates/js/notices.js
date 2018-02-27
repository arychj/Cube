(function($){
    var _notices;

    var _icons = {};

	var _precedences = {
		'top': 0
	};

	var _priorities = {
		'high': 1,
		'urgent': 0
	};

    var _interface = {
        add: function(details){
            var type = details.type;
            var priority = ('priority' in details ? details.priority : null);
            var symbol = ('symbol' in details ? details.symbol : details.type);
            var message =  details.message;
            var description = ('description' in details ? details.description : null);
			var precedence = ('precedence' in details ? details.precedence : null);
            var persist = ('persist' in details ? details.persist : false);
			var ttl = ('ttl' in details ? details.ttl : null);

			var hash = ('' + type + precedence + priority + symbol + message + description + precedence + persist + ttl).hash();

			var current = getNotice(type);
			if((current.length == 0) || (current.attr('notice-hash') != hash)){
				_interface.remove(type);

				var notice = createNotice(type, precedence, priority, symbol, message, description, persist, hash);

				if(precedence == 'top'){
					$(_notices).prepend(notice);
				}
				else{
					$(_notices).append(notice);
				}

				if(ttl != null){
					setTimeout(function(){ _interface.remove(type); }, 1000 * ttl);
				}

				$(notice).fadeIn();

				$(_notices).sort(function(a, b){
					return (getSortKey(a) > getSortKey(b) ? 1 : -1);
				});
			}
        },
        remove: function(type){
            getNotice(type).fadeOut(function(){
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

	function getNotice(type){
		return $(_notices).find('li[notice-type^=' + type + ']');
	}

	function getSortKey(notice){
		var precedence = ($(notice).attr('notice-precedence') in _precedences ? _precedences[$(notice).attr('notice-precedence')] : 9);
		var priority = ($(notice).attr('notice-priority') in _priorities ? _priorities[$(notice).attr('notice-priority')] : 9);
		var type = $(notice).attr('notice-type');

		return '' + precedence + priority + type;
	}

    function acceptParameters(params){
        _icons = $.extend(true, _icons, params['icons']);
    }

    function createNotice(type, precedence, priority, symbol, message, description, persist, hash){
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
                .attr({
					'notice-type': type,
					'notice-precedence': precedence,
					'notice-priority': priority
				})
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

		$(notice).attr('notice-hash', hash);

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

