

var mqtt = require('mqtt');
var express = require('express');
var settings = require('./settings.json');

// setup mqtt
var mqtt_options = {
    username: settings.mqtt.user,
    password: settings.mqtt.pass,
    port: settings.mqtt.port,
    clientId: 'hub-mqtt-bridge'
};

var mqttclient = mqtt.connect(settings.mqtt.host, mqtt_options);

// setup express.

var app = express();

app.get('/loc', function(req, res) {
    var auth = req.headers['x-hub-auth'];
    if (auth !== settings.auth_key) {
        res.sendStatus(403);
    } else {
        var device = req.query.d;
        
        var message = {
            latitude: req.query.la,
            longitude: req.query.lo,
            gps_accuracy: req.query.a,
            battery_level: req.query.b
        };

        var result = JSON.stringify(message, function(k, v) {
            if (k !== '' && v !== null) {
                return parseFloat(v);
            }
            return v;
        }); 

        mqttclient.publish('location/' + device, result);

        res.sendStatus(200);
    }
});

app.listen(8080, 'localhost', function() {
    console.log('hub-mqtt-bridge is running.');
});
