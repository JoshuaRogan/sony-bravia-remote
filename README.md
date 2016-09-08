# Sony Bravia Remote Control Module

This package helps interface with a sony bravia Andriod powered smart tv.

## Setup

This program attempts to talk to the bravia tv by sending IRCC signals through the network and authenticating via a preshared key. To send signals you need to know your tv's **IP Address**, **Port** (defaults to 80), and **auth-key** (defaults to 0000).

### Local

To connect to your Sony TV you need to know the local IP address (e.g. 192.168.1.2) of the TV. If possible, set it up as a static IP to prevent it from changing. This can be done at the router level.

### Remote

You can connect to your TV remotely just as easily as locally but with using your external IP (e.g. 73.17.832.11) address and setting up port forwarding on your router.

### AuthKey

To allow the TV to accept signals you have to send an auth key. This can be configured on the TV itself and defaults to 0000[Setting up pre-shared auth-key Instructions](https://github.com/breunigs/bravia-auth-and-remote#setup)

## Install with npm

``` npm install sony-bravia-tv-remote --save-dev ```

## Usage

Usage as a module with node or with ES6 Import

```javascript

//As module
const BraviaRemoteControl = require('sony-bravia-remote');

// As ES6 Import
import BraviaRemoteControl from 'sony-bravia-remote';

// Connect to a local sony tv at 192.168.1.2:80 with the auth key of 0000
const remote = new BraviaRemoteControl('192.168.1.2', 80, '0000');

// Connect to a tv at an external location on port 44444
const networkRemote = new BraviaRemoteControl('externaldomain.com', 44444, '0000');

// Send some single actions (all return promises)
remote.sendAction('power'); // turns on or off the tv
remote.sendAction('mute'); // mutes the tv

// Send sequences of actions (sent synchronously with delays)
remote.sendActionSequence('down down enter'); // Moves down twice then presses enter

//Open an app at a location on the app by navigating to it
remote.openAppSeq('down down right'); // Sends home, then down down right, then confirm
```


## Helpful Resources

[Shell based remote](https://github.com/breunigs/bravia-auth-and-remote)