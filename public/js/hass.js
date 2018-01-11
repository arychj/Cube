//https://home-assistant.io/developers/websocket_api/
(function($){
    var _host, _password, _log, _logLength, _timeFormat, _logEventsToConsole;

    var _socket = null;
    var _isOpen = false;
    var _watchedEntities = {};
    var _sequenceId = 0;
    var _sequenceCallbacks = {};

    function init(params){
        acceptParameters(params);
        discoverEntities();
        connect();
        subscribe();
        getStates();

        $(this).find('.control[entity-id]').on('click', controlClick);

        return this;
    }

    function acceptParameters(params){
        _host = params['host'];
        _password = params['password'];
        _logLength = params['logLength'];
        _timeFormat = params['timeFormat'];
        _log = params['log'];
        _logEventsToConsole = params['logEventsToConsole'];
    }

    function connect(){
        _socket = new WebSocket('ws://' + _host + '/api/websocket');

        authenticate(_password);

        _socket.addEventListener('open', function(event){
            _isOpen = true;
        });

        _socket.addEventListener('false', function(event){
            _isOpen = false;
        });

        _socket.onmessage = receiveMessage;
    }

    function authenticate(password){
        sendMessage('{"type": "auth","api_password": "' + password + '"}\n');
    }

    function subscribe(){
        sendMessage({'type': 'subscribe_events', 'event_type': 'state_changed'}, function(message){
            var event = parseEvent(message);
            logEvent(event);

            if(event.type == 'event'){
                var id = event.data.entity_id;
                if(id in _watchedEntities){
                    var state = event.data.new_state.state;
                    setState(id, state);
                }

            }
        }, false);
    }

    function getStates(){
        sendMessage({'type': 'get_states'}, function(event){
            $(event.result).each(function(index){
                if(this.entity_id in _watchedEntities){
                    setState(this.entity_id, this.state);
                }
            });
        });
    }

    function setState(id, state){
        var type = getTypeFromId(id);
        switch(type){
            case 'sensor':
                var sensor = getSensor(id);
                $(sensor).trigger('update-state', {'state': state});
                break;
            default:
                var control = getControl(id);
                $(control).trigger('update-state', {'state': state});
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

        if(message.id in _sequenceCallbacks){
            _sequenceCallbacks[message.id].callback(message);
            if(_sequenceCallbacks[message.id].deleteAfterUse){
                delete _sequenceCallbacks[message.id];
            }
        }
    }

    function sendMessage(message, callback, deleteAfterUse){
        if (typeof message !== 'string'){
            message['id'] = getSequenceId();
        }

        if(_isOpen){
            if(typeof message !== 'string'){
                if(typeof callback !== 'undefined'){
                    _sequenceCallbacks[message['id']] = {
                        'callback': callback,
                        'deleteAfterUse': (typeof deleteAfterUse === 'undefined' ? true : deleteAfterUse)
                    }
                }

                message = JSON.stringify(message);
            }

            _socket.send(message);
        }
        else{
            setTimeout(function(){ sendMessage(message, callback, deleteAfterUse); }, 500);
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

    function getControl(id){
        return $('.control[entity-id="' + id + '"]');
    }

    function getSensor(id){
        return $('.sensor[entity-id="' + id + '"]');
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

        $('.control[entity-id],.sensor[entity-id]').each(function(index){
            var entityId = $(this).attr('entity-id');
            if(!(entityId in _watchedEntities)){
                _watchedEntities[entityId] = [];
            }

            _watchedEntities[entityId].push(this);
        });

        console.log(_watchedEntities);
    }

    function logEvent(event){
        if(event.type == 'event'){
            log(
                formatTimestamp(event.time_fired) + 
                ': ' + 
                event.data.entity_id + 
                ' (' + 
                event.data.old_state.state + 
                ' -> ' + 
                event.data.new_state.state + 
                ')'
            );
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
        arguments[0] = $.extend(true,{
            'host': 'localhost',
            'password': '',
            'log': '[hass-log]',
            'logLength': 20,
            'timeFormat': 'YYYY-MM-DD HH:mm:ss.SSS',
            'logEventsToConsole': false
        }, arguments[0]);

        return init.apply(this, arguments);
    }

})(jQuery);

