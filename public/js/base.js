$(document).ready(function(){
    $('#cube').cubify();

    $('#floorplan').floorplan({
        'controls': {
            '#living_x5F_room': 'light.living_room',
            '#closet': 'light.entryway',
        },
        'onReady': function(){
            $('#cube').hass({
                'host': _global_credentials['hass-host'], 
                'password': _global_credentials['hass-password'],
                'logEventsToConsole': false
            });
        }
    });
});
