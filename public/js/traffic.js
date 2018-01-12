(function($){
    var _map, _element;
    var _apiurl, _apikey, _updateInterval, _location, _trafficLayer;

    function init(params){
        _element = this;
        acceptParameters(params);

        $.getScript(_apiurl + _apikey, function(){
            trafficMap();
    		update();
	    	setInterval(update, 1000 * 60 * _updateInterval);
        });

        return this;
    }

    function acceptParameters(params){
        _apiurl = params['apiUrl'];
        _apikey = params['apiKey'];
        _updateInterval = parseFloat(params['updateInterval']);

        coordinates = params['location'].split(',');
        _location = {
            'latitude': parseFloat(coordinates[0]),
            'longitude': parseFloat(coordinates[1])
        }
    }

    function trafficMap() {
        _map = new google.maps.Map($(_element)[0], {
            zoom: 11,
            center: {lat: _location.latitude, lng: _location.longitude},
            disableDefaultUI: true,
            draggable: false, 
            zoomControl: false, 
            scrollwheel: false, 
            disableDoubleClickZoom: true,
            styles: [
                {
                    elementType: 'geometry', 
                    stylers: [{color: '#000000', fill: '#000000'}]
                },
                {
                    elementType: 'labels.text.stroke', 
                    stylers: [{color: '#242f3e'}]
                },
                {
                    featureType: 'road.highway', 
                    elementType: 'geometry', 
                    stylers: [{color: '#666666', fill: '#666666'}]
                },
                {   
                  featureType: 'administrative.locality',
                  elementType: 'labels.text.fill',
                  stylers: [{color: '#ffffff'}]
                },
                {
                    featureType: 'transit',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'administrative.neighborhood',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'administrative.land_parcel',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });
	}

	function update() {
		if(_trafficLayer != null){
			_trafficLayer.setMap(null);
			_trafficLayer = null;
			_map.setZoom(_map.getZoom()); // this renews the view and forces new data to be requested
		}

		setTimeout(function () {
			_trafficLayer = new google.maps.TrafficLayer();
			_trafficLayer.setMap(_map);
		}, 100);
	}

    $.fn.traffic = function(params){
        arguments[0] = $.extend(true,{
            'apiUrl': 'https://maps.googleapis.com/maps/api/js?key=',
            'apiKey': '',
            'location': '0,0',
            'updateInterval': 5
        }, arguments[0]);

        return init.apply(this, arguments);
    }

})(jQuery);

