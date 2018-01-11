var _skycons;

$(document).ready(function(){
    $('#cube').cubify();

    $('#floorplan').floorplan({
        'controls': {
            '[id=living_x5F_room]': 'light.living_room',
            '[id=closet]': 'light.entryway',
        },
        'onReady': function(){
            $('.sensor').sensor();
            $('.control').control();

            $('#cube').hass({
                'host': _global_credentials['hass-host'], 
                'password': _global_credentials['hass-password'],
                'logEventsToConsole': false
            });
        }
    });
});
