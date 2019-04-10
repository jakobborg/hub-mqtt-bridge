

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
app.use(express.json());

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

        var topic = 'device/' + device + '/location';

        console.log("publishing " + result + ' to ' + topic);

        mqttclient.publish(topic, result, function(error, packet) {
            if (error) {
                console.log(error);
            }
        });
        res.sendStatus(200);
    }
});

app.post('/', function(req, res) {    
    console.log('Received request:' + JSON.stringify(req.body));    
    var auth = req.headers["x-hub-auth"];
    if (auth !== settings.auth_key) {
        res.sendStatus(403);
    } else {
        var topic = req.body.topic;
        var message = req.body.message;

        if (typeof message === "object") {
            message = JSON.stringify(message);
        }

        console.log('publishing ' + message + ' to ' + topic);

        mqttclient.publish(topic, message, function(error, packet) {
            if (error) {
                console.error(error);
            }
        });

        res.sendStatus(200);
    }
});

app.listen(8080, 'localhost', function() {
    console.log('hub-mqtt-bridge is running.');
});