# Cube
Home Assistant Command and Control Center

Please note: this project is currently *NOT* intended to be used on a publicly available host as the `js/credentials.js` file is downloaded to the client and used to authenticate to the HASS websocket.

## Usage
To run the server at the command line: `./cube.py`

By default, the cube will:
* serve pages on \*:4096
* look for templates in `./web/templates` relative to the location of `cube.py`
* look for assets in `./web/assets` relative to the location of `cube.py`
* embed parameters from `./parameters.json` relative to the location of `cube.py`


## Run as service
Add to `/etc/rc.local`:
```sh
#/bin/bash
sudo screen -S cube -X quit
sudo screen -S cube -dm sh -c 'sudo -u homeassistant -H /path/to/cube.py; echo $?; exec bash -i'
```
