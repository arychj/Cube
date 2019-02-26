$(document).ready(function(){
	if(window.location.hash == '#touch'){
		$('body').addClass('touch');
	}

    $('#cube').cubify();

    $('#notices').notices({
        'icons': {
            'eggplant': 'assets/img/eggplant.png',
            'fedex': 'assets/img/mail-icons/fedex.svg',
            'rocket': 'assets/img/rocket.png',
            'ups': 'assets/img/mail-icons/ups.svg',
            'usps': 'assets/img/mail-icons/usps.svg'
        }
    });

/*
    $('#traffic .map').traffic({
        'apiKey': _global_credentials['google-maps-apikey'],
        'location': _global_credentials['traffic-location']
    });
*/

    $('#agenda').agenda({
        'mode': 'poll',
        'headers': {
            'left': 'Sierra',
            'right': 'Erik'
        }
    });

    $('#floorplan').floorplan({
        'controls': {
            '#loft [id=office]': 'light.loft',
            '#upstairs [id=kitchen]': 'light.kitchen',
            '#upstairs [id=coat-closet]': 'light.coat_closet',
            '#upstairs [id=foyer]': 'light.foyer',
            '#upstairs [id=hall]': 'light.hall',
            '#upstairs [id=guest-room]': 'light.guest_room',
            '#upstairs [id=server-closet]': 'light.server_closet',
            '#upstairs [id=living-room]': 'light.living_room',
            '#downstairs [id=music-nook]': 'light.music_nook',
            '#downstairs [id=master-bedroom]': 'light.bedroom_master',
            '#downstairs [id=master-bathroom]': 'light.bathroom_master',
            '[id=stairs]': 'light.stair'
        },
        'onReady': function(){
            $('#cube').hass({
                'host': _global_credentials['hass-host'], 
                'password': _global_credentials['hass-password'],
                'virtualEntities': [
                    'sensor.time_to_work',
                    'sensor.fedex',
                    'sensor.usps_mail',
                    'sensor.usps_packages',
                    'sensor.ups_packages',
                    'sensor.fedex_packages',
                    'sensor.farmshare_day',
                    'sensor.trash_day',
                    'sensor.space_launch_today',
                    'sensor.pollen_level',
                    'sensor.pws_alerts',
                    'sensor.motion_3113',
                    //'sensor.motion_camera_front_door',
                    //'sensor.calendar_meeting_next_erik',
                    //'sensor.destination_next_erik',
                    //'sensor.destination_next_sierra',
                ],
                'logEventsToConsole': false,
                'onDiscoveryComplete': function(){
                    $('.sensor').sensor({
                        'bindings': {
                            '^motion_3113$': function(state){
                                if(state == 'movement'){
                                    $('[cube-face-show="left"]').click();
                                }
                            },
                            '^calendar_meeting_next_.+': function(state, attributes, type){
                                var parts = state.split('|');
                                if(parts.length == 4){
                                   $.notices.add({
                                        'type': type,
//                                        'precedence': 'top',
                                        'symbol': 'directions_car',
                                        'message':
                                            'It will take ' 
                                            + parts[0]
                                            + ' minutes to get to '
                                            + parts[1],
                                        'description': parts[2]
                                    });

                                    $.traffic.setDestination(parts[2]);
                                }
                                else{
                                    $.notices.remove(type);
                                    $.traffic.clearDestination();
                                }
                            },
                            '^xfinity_data_usage$': function(state){
                                $(this)
                                    .empty()
                                    .data({
                                        'percent': Math.floor(state * 100),
                                        'style': 'Arch',
                                        'color': '#fff',
                                        'back': '#333',
                                        'width': 2,
                                        'label': 'xfinity',
                                        'label_color': '#fff',
                                        'size': '75px'
                                    })
                                    .gaugeMeter();
                            },
                            '^verizon_data_usage$': function(state){
                                $(this)
                                    .empty()
                                    .data({
                                        'percent': Math.floor(state * 100),
                                        'style': 'Arch',
                                        'color': '#fff',
                                        'back': '#333',
                                        'width': 2,
                                        'label': 'verizon',
                                        'label_color': '#fff',
                                        'size': '75px'
                                    })
                                    .gaugeMeter();
                            },
                            '^pollen_level$': function(state){
                                var level = parseFloat(state);
                                if(isNaN(level) || (level <= 4.8)){
                                    $.notices.remove('pollen');
                                }
                                else{
                                    var rating = null;
                                    if(level > 4.8 && level <= 7.2)
                                        rating = 'medium';
                                    else if(level > 7.2 && level <= 9.6)
                                        rating = 'medium/high';
                                    else if(level > 9.6)
                                        rating = 'high';

                                    $.notices.add({
                                        'type': 'pollen',
                                        'symbol': 'local_florist',
                                        'message': 'Pollen rating is ' + rating + ' (' + level + ')'
                                    });
                                }
                            },
                            '^prusa_i3_mk3_time_(elapsed|remaining)$': function(state, attributes, type){
                                var sensor = this;

                                if(typeof $.prusaDurations === 'undefined'){
                                    $.prusaDurations = {};
                                }

                                if(type in $.prusaDurations){
                                    clearInterval($.prusaDuration[type]);
                                }

                                var seconds = parseInt(state);
                                if(isNaN(seconds)){
                                    $(sensor).text('--');
                                }
                                else{
                                    $.prusaDurations[type] = setInterval(function(){
                                        if(seconds >= 0){
                                            var duration = moment.duration(seconds--, 'seconds');

                                            $(sensor).text(
                                                duration.hours().toString().padStart(2, '0')
                                                + ':' +
                                                duration.minutes().toString().padStart(2, '0')
                                                + ':' +
                                                duration.seconds().toString().padStart(2, '0')
                                            );
                                        }
                                    }, 1000);
                                }
                            },
/*                            "todays_agenda": function(state, attributes){
                                var events = JSON.parse(attributes['events']);
                                $.agenda.update(events);
                            },
*/
/*
                            '^vehicle_fuel_level': function(state, attributes, type){
                                var name = type.substring(type.lastIndexOf('_') + 1).toLowerCase();

                                $(this)
                                    .empty()
                                    .data({
                                        'percent': Math.floor(state),
                                        'style': 'Arch',
                                        'color': '#fff',
                                        'back': '#333',
                                        'width': 2,
                                        'label': name,
                                        'label_color': '#fff',
                                        'size': '75px'
                                    })
                                    .gaugeMeter();
                            }
*/
                        }
                    });

                    $('.control').control();
                    $('.camera').camera({'baseurl': 'http://' + _global_credentials['hass-host']});
					$('.stream').stream();
                }
            });
        }
    });
});
