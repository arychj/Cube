# C<sup>3</sup>
A touch enabled Command and Control Center for Home Assistant

Please note: this project is currently *NOT* intended to be used on a publicly available host as the `js/credentials.js` file is downloaded to the client and used to authenticate to the HASS websocket.

## Usage
### Running the server
To run the server at the command line: `./cube.py`

By default, the cube will:
* serve pages on \*:4096
* look for templates in `./web/templates` relative to the location of `cube.py`
* look for assets in `./web/assets` relative to the location of `cube.py`
* embed parameters from `./parameters.json` relative to the location of `cube.py`


### Run the server as service
Add to `/etc/rc.local`:
```sh
#/bin/bash
sudo screen -S cube -X quit
sudo screen -S cube -dm sh -c 'sudo -u homeassistant -H /path/to/cube.py; echo $?; exec bash -i'
```

## Components

### cube.js
This is the primary interface component for the cube.

It expects six `.cube-face` divs with `cube-face` attributes of `front`, `back`, `top`, `bottom`, `left`, and `right`. The first face declared in the DOM is the default face. After the inactivity reset timeout, the cube will return to the default face.

Parameters:
```js
// initialization
$('#cube').cubify({
  'resetTimeout': 120                       // OPTIONAL
                                            // The number of seconds of inactivity before the cube
                                            // returns to the default face
});
```

### hass.js
On initialization, the `hass.js` component will discover all `sensor`, `control`, and `camera` entities in the specified interface.  Any element can be made into an entity by adding and entity class (`.sensor`, `.control`, or `.camera`) and giving it an `entity-id` attribute with the HASS entity-id.

Example entity:
```html
<div class="sensor" entity-id="sensor.time">&nbsp;</div>
```

The component will then subscribe to all state changes in Home Assistant and respond to changes in the discovered entities. Upon receipt of a state change to a watched entity, `hass.js` will trigger an `update-state` event on the entity element and pass it an `{'state': 'xxx', 'attributes': {}}` object as data. The cube consumes these events in `sensors.js`, `controls.js`, and `cameras.js`

```js
// initialization
$('#cube').hass({
  'host': 'localhost',                      // OPTIONAL
                                            // The Home Assistant host
  'password': '',                           // REQUIRED
                                            // The Home Assistant API password
  'virtualEntities': [],                    // OPTIONAL
                                            // List of entity-ids not present in interface but to
                                            // handle anyway
  'log': '[hass-log]',                      // OPTIONAL
                                            // The element to use as the log
  'logLength': 25,                          // OPTIONAL
                                            // The number of recent log entries to show
  'timeFormat': 'YYYY-MM-DD HH:mm:ss.SSS',  // OPTIONAL
                                            // The time format for the event log face
  'logEventsToConsole': false,              // OPTIONAL
                                            // Log all HASS events to the console
  'onDiscoveryComplete': null               // OPTIONAL
                                            // Callback for when entity discovery is complete
});
```

### sensors.js
This component responds to `update-state` events produced by `hass.js` and updates sensor states accordingly.

```js
// should be initialized after entity discovery is complete
$('.sensor').sensor({
  'bindings': []                            // OPTIONAL
                                            // Dictionary of custom bindings to apply to sensors
                                            // key: regex pattern matching sensor type
                                            // value: function(state, attributes, type){ }
});
```

### controls.js
This component responds to `update-state` events produced by `hass.js` and updates control states accordingly.

```js
// should be initialized after entity discovery is complete
$('.control').control();
```

### cameras.js
This component provides a janky "real-time" view from cameras in Home Assistant.

```js
// should be initialized after entity discovery is complete
$('.camera').camera({
  'baseurl': ''                             // OPTIONAL
                                            // Home Assistant provides a relative URL to capture from
                                            // the camera. This is the base url to load the image
                                            // and is typically the the same as the hass host.
});
```

### floorplan.js
On initialization, the `floorplan.js` component will convert the elements provided during initialization into controls attached to their respective entity-ids. The component is SVG capable.

```js
// initialization
$('#floorplan').floorplan({
  'controls': [],                           // REQUIRED
                                            // Dictionary mapping elements to entity-ids
  'onReady': null                           // OPTIONAL
                                            // Callback for when controls have been created
});

// example
$('#floorplan').floorplan({
  'controls': {
    '#living-room-lights': 'light.living_room'
  }
});
```

### notices.js
The `notices.js` component displays transient notices a list. It leverages virtual entities in `hass.js` to display entity states which are not always required to be shown; the number of USPS packages being delivered today, for example.

Only one instance of a notice type is allowed to be shown at a time. If you add a notice of an existing type, this will be interpreted as an update to the notice, and the new instance will replace the old.

```js
// initialization
$('#notices').notices({
  'max': 10,                                // OPTIONAL
                                            // The maximum number of notices to display
  'icons': [],                              // OPTIONAL
                                            // Dictionary of paths to additional icons
});

// adding a new notice
$.notices.add({
  'type': 'usps-package-count',             // REQUIRED
                                            // The notice type
  'message': '3 packages arriving today',   // REQUIRED
                                            // The message to display with the notice
  'description': null,                      // OPTIONAL
                                            // Additional information to display with the notice
  'priority': null,                         // OPTIONAL
                                            // Increases the priority of the notice so that it is more
                                            // prominent in the list
                                            // Values: [null, 'high', 'urgent']
  'symbol': '',                             // OPTIONAL
                                            // The symbol to display next to the notice
                                            // If not specified, will try to use notice type.
                                            // Looks in icons provided during initialization, 
                                            // if not found will try to use icon pack.
  'precedence': ''                          // OPTIONAL
                                            // Prepend the notice to the list instead of appending it
                                            // Values: [null, 'top']
}); 
```

By default, the `notices.js` component will use the [material-icons](http://materializecss.com/icons.html) pack.

### traffic.js
Creates a Google Map with traffic layer showing how heavy the traffic is in your local area. Please note, this component is not integrated with Home Assistant and does not respond to events. It is a pure client side implementation talking directly to Google.

```js
// initialization
$('#traffic').traffic({
  'apiKey': '',                              // REQUIRED
                                             // Google Maps API key
  'location': 'latitude,longitude'           // REQUIRED
                                             // The coordinates to center on
  'updateInterval': 5                        // OPTIONAL
                                             // The number of minutes between updates
                                             // Note: Your API key is rate limited, if you specify 
                                             // too small an interval your updates may be inconsistent
  
}); 
```
