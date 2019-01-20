(function($){
    var _agenda;
    var _mode, _headers, _pollInterval, _pollUrl;

    function init(params){
        console.log("Initializing agenda...");

        _agenda = this;

        acceptParams(params);

        setupTimeline();

        $.agenda = {
            update: updateAgenda
        };

        if(_mode == 'poll'){
            poll();
            setInterval(poll, _pollInterval);
        }

        return this;
    }
    
    function acceptParams(params){
        _mode = params['mode'];
        _headers = params['headers'];
        _pollInterval = parseInt(params['pollInterval']) * 1000;
        _pollUrl = params['pollUrl'];
    }

    function setupTimeline(){
        var length = Object.keys(_headers).length;
        if(length > 0){
            var width = (100 * 0.8 / length) + '%';

            for(side in _headers){
                $(_agenda).append(
                    $('<span/>')
                        .addClass('name')
                        .css({'width': width})
                        .text(_headers[side])
                );
            }
        }
    }

    function poll(){
		$.ajax({
            url: _pollUrl,
            type: 'GET',
            datatype: 'json',
            success: function (sEvents) {
				var events = JSON.parse(sEvents);
				updateAgenda(events);
            }
        });
    }

    function updateAgenda(events){
        if('events' in events){
            events = events['events']
        }

        $(_agenda).find('.timeline').fadeOut('slow', function(){
            $(this).remove();
        });

        var ordered = {};

        // normalize times
        $(events).each(function(i, e){
            e.start = moment(e.start).format('HH:mm');
            e.end = moment(e.end).format('HH:mm');

            events[i] = e;
        });

        // order the events
        events.sort(function(a, b){
            return (a.start < b.start ? -1 : 1);
        });

        // bucket the events
        $(events).each(function(i, e){
            if(ordered[e.start] == undefined){
                ordered[e.start] = [];
            }

            ordered[e.start].push(e);
        });

        // add the events to the timeline
        var timeline = $('<div class="timeline"></div>');
        $(Object.keys(ordered)).each(function(i, key){
            var slot = $('<div/>').addClass('slot');

            $(slot).append(
                $('<div/>')
                    .addClass('time')
                    .text(key)
            );

            $(ordered[key]).each(function(i, e){
                var event = $(_agenda).find('.event.template').clone().removeClass('template');

                event.addClass(e.side);
                event.find('.title').text(e.title);
                event.find('.description').text(e.description);
                event.find('.location').text(e.location);
                event.find('.start').text(e.start);
                event.find('.end').text(e.end);

                $(slot).append(event);
            });

            $(timeline).append(slot);
        });

        $(timeline).append(
            $('<div/>')
                .addClass('footer')
                .html('&nbsp;')
        );

        $(_agenda).append(timeline);

        $(timeline).fadeIn('slow');
    }

    $.fn.agenda = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true, {
            'mode': 'sensor',
            'pollInterval': 60 * 10, // 10 minutes
            'pollUrl': '/agenda',
            'headers': {}
        }, args[0]);

        return init.apply(this, args);
    }
})(jQuery);
