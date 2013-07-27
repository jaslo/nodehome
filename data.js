var mongojs = require("mongojs"),
    Deferred = require("JQDeferred"),
    mongoose = require("mongoose"),
    g = require("./globals");

var ObjectId = mongoose.Schema.Types.ObjectId;

/*
devices (name, type)
x10
thermostat
"timer"
"state"
events (name, type)
triggers
time-based (incl sunrise, sunset)
device-based (x10 status, change)
actions
event (run)
script
device (trigger, start timer, x10 on/off/dim)
meta
sound, speech
*/



var deviceSchema = new mongoose.Schema({
    name: String,
    location: String,
    group: String,
    typeName: String, // x10, timer, variable
    driver: String,
    id: String,
    lastChange: Date,
    value: String
});

var triggerSchema = new mongoose.Schema({
    typeName: String, // device (variable, timer)
    id: String,
    value: String
});

var actionSchema = new mongoose.Schema({
    typeName: String, // device, event, script, sound, speech
    id: String, // subject: A10, timer1, "lights off", "file.wav", "Hello World"
    value: String, //verb: on/off/dim, start, execute, loadrun, play, speak
    delay: Number // in seconds
});

var eventSchema = new mongoose.Schema({
    name: String,
    typeName: String,
    trigger: mongoose.Schema.Types.ObjectId, // only an objid ref to the trigger?
    actions: [ actionSchema ]
});


var Devices = mongoose.model('Devices', deviceSchema);
var Triggers = mongoose.model('Triggers', triggerSchema);
var Actions = mongoose.model('Actions', actionSchema);
var Events = mongoose.model('Events', eventSchema);

var data = function() {
    var self = this;

    var dbName = "home";

    this.connect = function(server, name, password) {
        var dfr = new Deferred();
        mongoose.connect("mongodb://" + server + "/" + dbName);

        var mdb = mongoose.connection;
        mdb.on('error', function () {
            dfr.reject(0);
            console.error.bind(console, 'connection error:')
        });

        mdb.once('open', function callback () {
            dfr.resolve(0);
        });
        return dfr.promise();
    }

    this.getDevices = function() {
        var dfr = new Deferred();
        Devices.find({}, function(err,docs) {
            dfr.resolve(err,docs);
        });
        return dfr.promise();
    }

    
}

var dbobj = new data();

module.exports = dbobj;

