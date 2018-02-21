$(document).ready(function(){
    $('#cube').cubify();

    $('#notices').notices({
        'icons': {
            'fedex': 'assets/img/mail-icons/fedex.svg',
            'ups': 'assets/img/mail-icons/ups.svg',
            'usps': 'assets/img/mail-icons/usps.svg'
        }
    });

    $('#traffic .map').traffic({
        'apiKey': _global_credentials['google-maps-apikey'],
        'location': _global_credentials['traffic-location']
    });

    $('#floorplan').floorplan({
        'controls': {
            '#loft [id=office]': 'light.loft',
            '#upstairs [id=closet]': 'light.coat_closet',
            '#upstairs [id=hall]': 'light.hall',
            '#upstairs [id=living-room]': 'light.living_room',
            '#downstairs [id=music-nook]': 'light.music_nook',
            '#downstairs [id=master-bedroom]': 'light.bedroom_master',
            '#downstairs [id=master-bathroom-main]': 'light.light_3056',
            '#downstairs [id=master-bathroom-closet]': 'light.light_3057',
            '#downstairs [id=master-bathroom-laundry]': 'light.light_3058',
            '[id=stairs]': 'light.stair'
        },
        'onReady': function(){
            $('#cube').hass({
                'host': _global_credentials['hass-host'], 
                'password': _global_credentials['hass-password'],
                'virtualEntities': [
                    'sensor.time_to_work',
                    'sensor.ups',
                    'sensor.fedex',
                    'sensor.usps_mail',
                    'sensor.usps_packages',
                    'sensor.trash_day'
                ],
                'logEventsToConsole': false,
                'onDiscoveryComplete': function(){
                    $('.sensor').sensor();
                    $('.control').control();
                    $('.camera').camera({'baseurl': 'http://' + _global_credentials['hass-host']});
                }
            });
        }
    });
});
