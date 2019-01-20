(function($){
    var _map, _element;
    var _destination = null;
    var _apiurl, _apikey, _updateInterval, _location, _trafficLayer, _directionsService, _directionsRenderer;

    var _interface = {
        setDestination: function(destination){
            _destination = destination;
            update();
        },
        clearDestination: function(){
            _interface.setDestination(null);
        }
    };

    function init(params){
        _element = this;
        acceptParameters(params);

        $.getScript(_apiurl + _apikey, function(){
            trafficMap();
            route();
    		update();
	    	setInterval(update, 1000 * 60 * _updateInterval);
        });

        $.traffic = _interface;

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

    function route(){
        _directionsService = new google.maps.DirectionsService;
        _directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: true
        });
        _directionsDisplay.setMap(_map);
    }

	function update() {
		if(_trafficLayer != null){
			_trafficLayer.setMap(null);
			_trafficLayer = null;
			_map.setZoom(_map.getZoom()); // this renews the view and forces new data to be requested
		}

        if(_destination != null){
            _directionsDisplay.setMap(_map);
            _directionsService.route({
                origin: '{{ traffic.home }}',
                destination: _destination,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    // deal with this
                    // var warnings = document.getElementById("warnings_panel");
                    // warnings.innerHTML = "" + response.routes[0].warnings + "";

                    _directionsDisplay.setDirections(response);

                    var leg = response.routes[0].legs[0];
                    makeMarker(leg.start_location, "Home");
                    makeMarker(leg.end_location, _destination);
                }
                else {
                    console.log('Directions request failed due to ' + status);
                }
            });
        }
        else{
            _directionsDisplay.setMap(null);
        }

		setTimeout(function () {
			_trafficLayer = new google.maps.TrafficLayer();
			_trafficLayer.setMap(_map);
		}, 100);
	}

    function makeMarker(position, title, icon) {
        new google.maps.Marker({
            map: _map,
            position: position,
            title: title,
            icon: icon
        });
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

