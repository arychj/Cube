$(document).ready(function(){
    $('#cube').cubify();

    $('#traffic .map').traffic({
        'apiKey': _global_credentials['google-maps-apikey'],
        'location': _global_credentials['traffic-location']
    });

    $('#notices').notices({
        'persist': [
            {
                'type': 'time-to-work',
                'symbol': 'directions_car', 
                'message': 'It will currently take <span class="sensor" entity-id="sensor.time_to_work"/> minutes to get to work',
                'priority': 'top'
            }
        ]
    });

    $('#floorplan').floorplan({
        'controls': {
            '#loft [id=office]': 'light.loft',
            '#upstairs [id=living-room]': 'light.living_room',
            '#upstairs [id=closet]': 'light.entryway',
            '#downstairs [id=master-bedroom]': 'light.bedroom_master',
            '#downstairs [id=master-bathroom-main]': 'light.light_3056',
            '#downstairs [id=master-bathroom-closet]': 'light.light_3057',
            '#downstairs [id=master-bathroom-laundry]': 'light.light_3058',
            '[id=stairs]': 'light.stair'
        },
        'onReady': function(){
            $('.sensor').sensor();
            $('.control').control();
            $('.camera').camera({'baseurl': 'http://' + _global_credentials['hass-host']});

            $('#cube').hass({
                'host': _global_credentials['hass-host'], 
                'password': _global_credentials['hass-password'],
                'logEventsToConsole': false
            });
        }
    });
});
