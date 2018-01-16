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
                    state = parseInt(state) + '%';
                    $(this).html(state);
                });
            }
            else if(type == 'ups'){
                bind(this, function(state){
                    count = parseInt(state);
                    if(count > 0){
                        $.notices.add({
                            'type': type,
                            'message': 
                                'There ' + 
                                (count == 1 ? 'is' : 'are') +
                                ' ' + count +
                                ' package' + (count == 1 ? '' : 's') + 
                                ' arriving today via UPS'
                        });

                        $(this).html(count);
                    }
                    else{
                        $.notices.remove(type);
                    }
                });
            }
            else if(type == 'fedex'){
                bind(this, function(state, attributes){
                    var count = 0;

                    var statuses = ['delivered']
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
            else if(type == 'traffic_incidents'){
                bind(this, function(state){
                    $.notices.remove('traffic-incident');

                    var content = $('<ul/>');
                    var incidents = JSON.parse(state);
                    for(var i = 0; i < incidents.length; i++){
                        $.notices.add({
                            'type': 'traffic-incident-' + i,
                            'symbol': 'warning',
                            'message': incidents[i]
                        });

                        content.append($('<li/>').html(incidents[i]));
                    }

                    $(this).html(content);
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

