(function($){
    var _sensors, _skycons, _patterns;

    var _bindings = {
        '^motion_.*': function(state){
            $(this).removeClass('movement');
            if(state == 'movement'){
                $(this).addClass('movement');
            }
        },
        '^dark_sky_icon$': function(state){
            _skycons.remove($(this).attr('id'));
            _skycons.add($(this).attr('id'), state);
        },
        '.*temperature.*': function(state){
            $(this).html(Math.round(state));
        },
        '^date$': function(state){
            var date = moment(state).format('dddd, MMMM Do, YYYY');
            $(this).html(date);
        },
        'wind_speed$': function(state){
            $(this).html(Math.round(state));
        },
        'wind_bearing$': function(state){
            var directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'];

            var bearing = Math.round(state);
            direction = directions[Math.round(bearing / 22.5)];

            $(this).html(direction);
        },
        '^(sunrise|sunset)$': function(state){
            var date = moment(state).format('HH:mm');
            $(this).html(date);
        },
        '^dark_sky_summary$': function(state){
            var suffixes = {
                'ing': {
                    'trim': ['e'],
                    'words': ['rain', 'snow', 'mist']
                },
                'ly': {
                    'words': ['light']
                }
            };

            state = state.toLowerCase().split(' ');
            for(var i = 0; i < state.length; i++){
                for(var suffix in suffixes){
                    for(var w = 0; w < suffixes[suffix]['words'].length; w++){
                        if(state[i] == suffixes[suffix]['words'][w]){
                            if('trim' in suffixes[suffix]){
                                for(var trim in suffixes[suffix]['trim']){
                                    if(state[i].endsWith(trim)){
                                        state[i] = state[i].trim(0, -1 * trim.length);
                                        break;
                                    }
                                }
                            }

                            state[i] = state[i] + suffix;
                        }
                    }
                }
            }
/*
            if(state.length <= 2){
                var last = state.length - 1;
                if(!state[last].endsWith('y')){
                    if(state[last].endsWith('e')){
                        state = state[last].slice(0, -1);
                    }

                    state[last] = state[last] + 'ing';
                }

                if(state.length == 2){
                    if(state[0] == 'light'){
                        state[0] = state[0] + 'ly';
                    }
                }
            }
*/
            state = state.join(' ');

            state = 'Currently ' + state + '.';
            $(this).html(state);
        },
        '^dark_sky_precip_probability.*': function(state){
            state = parseFloat(state);
            state = (isNaN(state) ? 0 : state) + '%';
            $(this).html(state);
        },
        '^(ups|fedex)_packages$': function(state, attributes, type){
            var count = parseInt(state);
            if(count > 0){
                type = type.substring(0, type.indexOf('_'));
                $.notices.add({
                    'type': type,
                    'message': 
                        'There ' + 
                        (count == 1 ? 'is' : 'are') +
                        ' ' + count +
                        ' package' + (count == 1 ? '' : 's') + 
                        ' arriving today via ' +
                        type.toUpperCase()
                });

                $(this).html(count);
            }
            else{
                $.notices.remove(type);
            }
        },
        '^usps': function(state, attributes, type){
            count = parseInt(state);
            if(count > 0){
                $.notices.add({
                    'type': type,
                    'symbol': 'usps',
                    'message': 
                        'There ' + 
                        (count == 1 ? 'is' : 'are') +
                        ' ' + count +
                        ' ' + (type.endsWith('mail') ? 'letter' : 'package') + (count == 1 ? '' : 's') + 
                        ' arriving today via USPS'
                });

                $(this).html(count);
            }
            else{
                $.notices.remove(type);
            }

        },
        '^trash_day$': function(state, attributes, type){
            $.notices.remove('trash-day');

            if(state == 'yes'){
                var notice = {
                    'type': 'trash-day',
                    'symbol': 'delete',
                    'priority': 'urgent',
                    'message': 'Tomorrow is trash day'
                };

                $.notices.add(notice);
            }
        },
        '^space_launch_today$': function(state, attributes, type){
            $.notices.remove('space-launch');

            if(state.length > 0){
                var notice = {
                    'type': 'space-launch',
                    'symbol': 'rocket',
                    'message': '<em>' + state + '</em> launch today!'
                };

                $.notices.add(notice);
            }
        },
        '^farmshare_day$': function(state, attributes, type){
            $.notices.remove('farmshare-day');

            if(state == 'yes'){
                var notice = {
                    'type': 'farmshare-day',
                    'symbol': 'eggplant',
                    'priority': 'urgent',
                    'message': 'Vegetables incoming'
                };

                $.notices.add(notice);
            }
        },
        '^traffic_incidents$': function(state, attributes, type){
                $.notices.remove('traffic-incident');

            var content = $('<ul/>');
            var incidents = JSON.parse(state);
            for(var i = 0; i < incidents.length; i++){
                var incident = incidents[i];

                var message = $('<span/>');

                $(message).append(
                    $('<span/>')
                       .addClass('location')
                       .html(incident.road + ' ' + incident.direction)
                );

                if(incident.delay > 0){
                    var delay = $('<span/>')
                            .addClass('delay')
                            .html(incident.delay + ' minute delay');

                    if((incident.delay >= 5) && (incident.delay < 10)){
                        $(delay).addClass('medium');
                    }
                    else if(incident.delay >= 10){
                        $(delay).addClass('major');
                    }

                    $(message).append(delay);
                }

                $.notices.add({
                    'type': 'traffic-incident-' + i,
                    'symbol': 'info_outline',
                    'message': message,
                    'description': incident.description
                });

                content.append($('<li/>').html(incidents[i]));
            }

            $(this).html(content);
        },
        '^time_to_work$': function(state, attributes, type){
            $.notices.add({
                'type': type,
                'precedence': 'top',
                'symbol': 'directions_car',
                'message': 'It will currently take ' + state + ' minutes to get to work'
            });
        
            $(this).html(state);
        },
        '^pws_alerts$': function(state, attributes, type){
            // https://www.wunderground.com/weather/api/d/docs?d=data/alerts
            var ignore = ['SVR', 'SPE'];
            var urgent = ['HUR', 'TOR', 'WRN', 'FLO', 'VOL', 'HWW'];

            $.notices.remove('weather-alert');

            // wunderground component doesn't provide type for single alerts unless hack is applied
            // so just display it and don't bother processing
            if('Description' in attributes){ 
                $.notices.add({
                    'type': 'weather-alert-unknown',
                    'symbol': 'warning',
                    'message': attributes['Description']
                });
            }
            else{
                for(key in attributes){
                    if(key.startsWith('Message')){
                        var keyNodes = key.split('_');
                        if(keyNodes.length == 2){
                            var alertType = keyNodes[1];
                            if(!ignore.includes(alertType)){
                                var message = attributes['Description_' + alertType];
                                var description = attributes['Message_' + alertType].replace(/\.\.\./g, ' ').trim().split('\n')[0];
                                var start = attributes['Date_' + alertType];
                                var end = attributes['Expires_' + alertType];

                                var notice = {
                                    'type': 'weather-alert-' + alertType,
                                    'symbol': 'warning',
                                    'message': message
                                };

                                if(urgent.includes(alertType)){
                                    notice['priority'] = 'urgent';
                                }

                                $.notices.add(notice);
                            }
                        }
                    }
                }
            }
        }
    };

    function init(params){
        console.log("Initializing sensors...");

        _sensors = this;

        acceptParameters(params);

        _skycons = new Skycons({"color": "#dddddd"});
        _skycons.play();

        buildBindingPatterns();
        setupSensors();

        return this;
    }

    function buildBindingPatterns(){
        _patterns = [];

        for(pattern in _bindings){
            _patterns[pattern] = new RegExp(pattern, 'i');
        }
    }

    function acceptParameters(params){
         $.extend(true, _bindings, params['bindings']);
    }

    function setupSensors(){
        $(_sensors).each(function(){
            var type = getType(this);

            var match = false;
            for(pattern in _patterns){
                if(_patterns[pattern].test(type)){
                    bind(this, _bindings[pattern]);
                    match = true;
                    break;
                }
            }

            if(!match){
                bind(this, function(state){
                    $(this).html(state);
                });
            }
        });
    }


    function getType(sensor){
        return $(sensor).attr('entity-id').split('.')[1];
    }

    function bind(sensor, updater){
        $(sensor).bind('update-state', function(e, data){
            updater.apply(this, [data.state, data.attributes, getType(sensor)]);
        });
    }

    $.fn.sensor = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true, {
            'bindings': []
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);
