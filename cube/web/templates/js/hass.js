//https://home-assistant.io/developers/websocket_api/
(function($){
    var _host, _password, _virtualEntities, _log, _logLength, _timeFormat, _logEventsToConsole;

    var _hass = null;

    var _socket = null;
    var _isOpen = false;
    var _connectionMonitor = null;
    var _connectionMonitorInterval = 10 * 1000;

    var _watchedEntities = {};
    var _sequenceId = 0;
    var _sequenceCallbacks = {};
    var _preSequenceCallbacks = [];

    function init(params){
        _hass = this;

        acceptParameters(params);
        discoverEntities();

        if(params['onDiscoveryComplete'] != null){
            params['onDiscoveryComplete']();
        }

        setupConnection();
        startConnectionMonitor();

        $(_hass).find('.control[entity-id]').on('click', controlClick);

        return this;
    }

    function acceptParameters(params){
        _host = params['host'];
        _password = params['password'];
        _virtualEntities = params['virtualEntities'];
        _logLength = params['logLength'];
        _timeFormat = params['timeFormat'];
        _log = params['log'];
        _logEventsToConsole = params['logEventsToConsole'];
    }

    function startConnectionMonitor(){
        _connectionMonitor = setInterval(setupConnection, _connectionMonitorInterval);
    }

    function setupConnection(){
        if(!_isOpen){
            connect(function(){
                subscribe();
                getStates();
            });
        }
    }

    function connect(callback){
        if((_socket == null) || (_socket.readyState == 3)){
            console.log('Connecting to HASS...');
            $('#connection-status').dweetimate();

            _sequenceId = 0;
            _sequenceCallbacks = {};
            _preSequenceCallbacks = [];

            _socket = new WebSocket('ws://' + _host + '/api/websocket');

            _socket.onmessage = receiveMessage;

            _socket.addEventListener('open', function(event){
                console.log('Established connection to HASS...');
                $('#connection-status').dweetistop();
                _isOpen = true;

                authenticate(_password, function(){
                    if(typeof callback != 'undefined'){
                        callback();
                    }
                });
            });

            _socket.addEventListener('close', function(event){
                console.log('Disconnected from HASS...');
                $('#connection-status').addClass('connecting');
                _isOpen = false;
            });

            _socket.addEventListener('error', function(event){
                console.log(event);
            });
        }
    }

    function authenticate(password, callback){
        sendMessage({'type': 'auth', 'access_token': password}, callback, true, true);
    }

    function subscribe(callback){
        sendMessage({'type': 'subscribe_events', 'event_type': 'state_changed'}, function(message){
            var event = parseEvent(message);
            logEvent(event);

            if(event.type == 'event'){
                var id = event.data.entity_id;
                if(id in _watchedEntities){
                    var state = event.data.new_state.state;
                    var attributes = event.data.new_state.attributes;
                    setState(id, state, attributes);
                }

            }
        }, false);
    }

    function getStates(){
        sendMessage({'type': 'get_states'}, function(event){
            $(event.result).each(function(index){
                var entity_id = 'unknown';
                try{
                    entity_id = this.entity_id;
                    if(entity_id in _watchedEntities){
                        setState(entity_id, this.state, this.attributes);
                    }
                }
                catch(error){
                    console.log({
                        'entity_id': entity_id,
                        'error': error
                    });
                }
            });
        });
    }

    function setState(id, state, attributes){
        var type = getTypeFromId(id);
        switch(type){
            case 'sensor':
                var sensor = getSensor(id);
                $(sensor).trigger('update-state', {'state': state, 'attributes': attributes, 'entityId': id});
                break;
            case 'camera':
                var camera = getCamera(id);
                $(camera).trigger('update-state', {'state': state, 'attributes': attributes, 'entity-id': id});
                break;
            default:
                var control = getControl(id);
                $(control).trigger('update-state', {'state': state, 'attributes': attributes, 'entity-id': id});
                break;
        }
    }

    function callService(domain, service, entity){
        sendMessage({
            'type': 'call_service',
            'domain': domain,
            'service': service,
            'service_data': {
                'entity_id': entity
            }
        });
    }

    function receiveMessage(message){
        var message = JSON.parse(message.data);

        if(_logEventsToConsole){
            console.log(message);
        }

        if(('type' in message) && (message.type == 'auth_required')){
            authenticate(_password);
        }
        else if(('id' in message) && (message.id in _sequenceCallbacks)){
            _sequenceCallbacks[message.id].callback(message);
            if(_sequenceCallbacks[message.id].deleteAfterUse){
                delete _sequenceCallbacks[message.id];
            }
        }
        else if(_preSequenceCallbacks.length > 0){
            for(var i = 0; i < _preSequenceCallbacks.length; i++){
                _preSequenceCallbacks[i](message);
            }

            _preSequenceCallbacks = [];
        }
    }

    function sendMessage(message, callback, deleteAfterUse, isPreSequenceMessage){
        if(_isOpen){
            if ((typeof isPreSequenceMessage != 'undefined') && isPreSequenceMessage){
                if(typeof callback !== 'undefined'){
                    _preSequenceCallbacks.push(callback);
                }
            }
            else{
                message['id'] = getSequenceId();

                if(typeof callback !== 'undefined'){
                    _sequenceCallbacks[message['id']] = {
                        'callback': callback,
                        'deleteAfterUse': (typeof deleteAfterUse === 'undefined' ? true : deleteAfterUse)
                    }
                }
            }

            message = JSON.stringify(message);

            _socket.send(message);
        }
        else{
            setTimeout(function(){ sendMessage(message, callback, deleteAfterUse, isPreSequenceMessage); }, 500);
        }
    }

    function controlClick(event){
        var id = $(this).attr('entity-id');
        var type = getTypeFromId(id);

        switch(type){
            case 'light':
                callService('light', 'toggle', id);
                break;
        }
    }

    function getDomain(id){
        return id.split('.')[0];
    }

    function getControl(id){
        return $('.control[entity-id="' + id + '"]');
    }

    function getSensor(id){
        return $('.sensor[entity-id="' + id + '"]');
    }

    function getCamera(id){
        return $('.camera[entity-id="' + id + '"]');
    }

    function parseEvent(message){
        if(message.success === 'false'){
            log(message.error.message);
            throw message.error.message;
        }
        else{
            if(message.type == 'event'){
                message.event.type = message.type;
                message.event.id = message.id;

                return message.event;
            }
            else{
                return message;
            }
        }
    }

    function discoverEntities(){
        _watchedEntities = {}

        $('.control[entity-id],.sensor[entity-id],.camera[entity-id]').each(function(index){
            var entityId = $(this).attr('entity-id');
            watchEntity(entityId, this);
        });

        $.each(_virtualEntities, function(index){
            var entity = $('<div/>')
                .addClass('virtual-entity')
                .addClass(getDomain(this))
                .attr('entity-id', this);

            $(_hass).append(entity);

            watchEntity(this, entity[0]);
        });

        console.log(_watchedEntities);
    }

    function watchEntity(entityId, element){
        if(!(entityId in _watchedEntities)){
            _watchedEntities[entityId] = [];
        }

        _watchedEntities[entityId].push(element);
    }

    function logEvent(event){
        if(event.type == 'event'){
            var message = formatTimestamp(event.time_fired) + ': ' + event.data.entity_id + ' ';

            if(('old_state' in event.data) && ('new_state' in event.data)){
                if(event.data.new_state != null){
                    if(event.data.old_state != null){
                        message += '(' + event.data.old_state.state + ' -> ' + event.data.new_state.state + ')';
                    }
                    else{
                        message += '(' + event.data.new_state.state + ')';
                    }
                }
            }
            else{
                message += '(' + event.data.state + ')';
            }

            log(message);
        }
        else{
            log(
                formatTimestamp() +
                ': ' + 
                event.type
            );
        }
    }

    function log(s){
        $(_log).prepend('<p>' + s + '</p>');

        var events = $(_log).find('p');
        if(events.length > _logLength){
            var eventsToRemove = events.slice(_logLength - events.length);
            $(eventsToRemove).remove();
        }
    }

    function formatTimestamp(ts){
        if(window.moment){
            var m = (ts === undefined ? moment() : moment(ts));
            return m.format(_timeFormat);
        }
        else{
            return (ts === undefined ? Date() : ts);
        }
    }

    function getSequenceId() {
        return ++_sequenceId;
    }

    function getTypeFromId(id){
        return id.substring(0, id.indexOf('.'));
    }

    $.fn.hass = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
            'host': 'localhost',
            'password': '',
            'virtualEntities': [],
            'log': '[hass-log]',
            'logLength': 25,
            'timeFormat': 'YYYY-MM-DD HH:mm:ss.SSS',
            'logEventsToConsole': false,
            'onDiscoveryComplete': null
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

