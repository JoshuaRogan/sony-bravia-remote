# Sony Bravia Remote Control Module

This package helps interface with a sony bravia Andriod powered smart tv. 

## Setting up TV
Auth key, IP Address, Remote address

## Install with npm

``` npm install sony-bravia-tv-remote --save-dev ```

## Usage

Usage as a module with node

```javascript
const BraviaRemoteControl = require('sony-bravia-remote');

// Connect to a local sony tv at 192.168.1.2:80 with the auth key of 0000
const remote = new BraviaRemoteControl('192.168.1.2', 80, '0000');

// Connect to a tv at an external location on port 44444
const networkRemote = new BraviaRemoteControl('externaldomain.com', 44444, '0000');

// Send some single actions (all return promises)
remote.sendAction('power'); // turns on or off the tv
remote.sendAction('mute'); // mutes the tv

// Send sequences of actions (sent synchrounously with delays)
remote.sendActionSequence('down down enter'); // Moves down twice then presses enter

//Open an app at a location on the app by navigating to it
remote.openAppSeq('down down right'); // Sends home, then down down right, then confirm
```


## Helpful Resources

[Shell based remote](https://github.com/breunigs/bravia-auth-and-remote)

