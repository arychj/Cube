(function($){
    var _sensors, _skycons;

    function init(params){
        console.log("Initializing sensors...");

        _sensors = this;

        acceptParameters(params);

        _skycons = new Skycons({"color": "#dddddd"});
        _skycons.play();

        setupSensors();

        return this;
    }

    function acceptParameters(params){
    }

    function setupSensors(){
        $(_sensors).each(function(){
            var type = getType(this);
            if(type == 'dark_sky_icon'){
                bind(this, function(state){
                    _skycons.remove($(this).attr('id'));
                    _skycons.add($(this).attr('id'), state);
                });
            }
            else if(type.toLowerCase().endsWith('temperature')){
                bind(this, function(state){
                    $(this).html(Math.round(state));
                });
            }
            else if(type == 'date'){
                bind(this, function(state){
                    var date = moment(state).format('dddd, MMMM Do, YYYY');
                    $(this).html(date);
                });
            }
            else if(type.toLowerCase().endsWith('wind_speed')){
                bind(this, function(state){
                    $(this).html(Math.round(state));
                });
            }
            else if(type.toLowerCase().endsWith('wind_bearing')){
                bind(this, function(state){
                    var directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'];

                    var bearing = Math.round(state);
                    direction = directions[Math.round(bearing / 22.5)];

                    $(this).html(direction);
                });
            }
            else if(['sunrise', 'sunset'].includes(type)){
                bind(this, function(state){
                    var date = moment(state).format('HH:mm');
                    $(this).html(date);
                });
            }
            else if(type == 'dark_sky_summary'){
                bind(this, function(state){
                    state = 'Light rain';

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
                });
            }
            else if(['dark_sky_precip_probability', 'pws_precip_1d'].includes(type)){
                bind(this, function(state){
                    state = parseInt(state);
                    state = (isNaN(state) ? 0 : state) + '%';
                    $(this).html(state);
                });
            }
            else if(['ups', 'fedex'].includes(type)){
                bind(this, function(state, attributes){
                    var count = 0;

                    var statuses = ['delivered', 'out_for_delivery'] //label_created, in_transit
                    for(var i = 0; i < statuses.length; i++){
                        if(statuses[i] in attributes){
                            count += parseInt(attributes[statuses[i]]);
                        }
                    }
                    
                    if(count > 0){
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
                });
            }
/*
            else if(type == 'fedex'){
                bind(this, function(state, attributes){
                    var count = 0;

                    var statuses = ['delivered'] //label_created, in_transit
                    for(var i = 0; i < statuses.length; i++){
                        if(statuses[i] in attributes){
                            count += parseInt(attributes[statuses[i]]);
                        }
                    }

                    if(count > 0){
                        $.notices.add({
                            'type': type,
                            'message': 
                                'There ' + 
                                (count == 1 ? 'is' : 'are') +
                                ' ' + count +
                                ' package' + (count == 1 ? '' : 's') + 
                                ' arriving today via FedEx'
                        });

                        $(this).html(count);
                    }
                    else{
                        $.notices.remove(type);
                    }
                });
            }
*/
            else if(type.startsWith('usps')){
                bind(this, function(state){
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
                });

            }
            else if(type == 'trash_day'){
                bind(this, function(state){
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
                });
            }
            else if(type == 'traffic_incidents'){
                bind(this, function(state){
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
                });
            }
            else if(type == 'time_to_work'){
                bind(this, function(state){
                    $.notices.add({
                        'type': type,
                        'precedence': 'top',
                        'symbol': 'directions_car',
                        'message': 'It will currently take ' + state + ' minutes to get to work'
                    });
                
                    $(this).html(state);
                });
            }
            else if(type == 'pws_alerts'){
                bind(this, function(state, attributes){
                    // https://www.wunderground.com/weather/api/d/docs?d=data/alerts
                    var ignore = ['SVR', 'SPE'];
                    var urgent = ['HUR', 'TOR', 'WRN', 'FLO', 'VOL', 'HWW'];

                    $.notices.remove('weather-alert');

                    for(key in attributes){
                        if(key.startsWith('Message')){
                            var alertType = key.substring(key.indexOf('_') + 1);
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
                });
            }
            else{
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
            updater.apply(this, [data.state, data.attributes]);
        });
    }

    $.fn.sensor = function(params){
        arguments[0] = $.extend(true,{
        }, arguments[0]);

        return init.apply(this, arguments);
    }

})(jQuery);

