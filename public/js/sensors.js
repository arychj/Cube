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
            else if((type == 'sunrise') || (type == 'sunset')){
                bind(this, function(state){
                    var date = moment(state).format('HH:mm');
                    $(this).html(date);
                });
            }
            else if(type == 'dark_sky_summary'){
                bind(this, function(state){
                    state = state.toLowerCase().split(' ');
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

                    state = state.join(' ');

                    state = 'Currently ' + state + '.';
                    $(this).html(state);
                });
            }
            else if(type == 'dark_sky_precip_probability'){
                bind(this, function(state){
                    state = parseInt(state) + '%';
                    $(this).html(state);
                });
            }
            else if(['ups', 'fedex'].includes(type)){
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
                                ' arriving today via ' + 
                                (type == 'fedex' ? 'FedEx' : type.toUpperCase())
                        });

                        $(this).html(count);
                    }
                    else{
                        $.notices.remove(type);
                    }
                });
            }
            else if(type.startsWith('usps')){
                console.log('usps sensor: ' + type);
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
            updater.apply(this, [data.state]);
        });
    }

    $.fn.sensor = function(params){
        arguments[0] = $.extend(true,{
        }, arguments[0]);

        return init.apply(this, arguments);
    }

})(jQuery);

