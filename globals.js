var path = require("path"),
    argv = require("optimist").argv,
    cluster = require("cluster"),
    Deferred = require("JQDeferred");

var g = {

    ti103init: "192.168.0.143:2001",
//    ti103init: '/dev/ttyUSB0,{ "baudrate": 9600 }',
//    acrf2init: "/dev/nul",
    acrfinit: '/dev/ttyUSB0,{ "baudrate": 4800 }',

    MongoHost: "localhost",
    htmlBase: path.join(__dirname,"/html"),

    LOG_VERBOSE: 10,
    LOG_DIAGNOSTIC: 9,
    LOG_DEBUG: 8,
    LOG_TRACE: 7,

    LOG_WARNING: 5,
    LOG_IMPORTANT: 4,

    LOG_ERROR: 2,
    LOG_URGENT: 1,
    LOG_CRITICAL: 0,

    maxLogLevel: 10,

    log: function(level, message) {
        if (level <= g.maxLogLevel) {
            console.log(message);
        }
    },

    waitFor: function(millis) {
        var dfr = new Deferred();
        var theTimer = setTimeout(function() {
            clearTimeout(theTimer);
            dfr.resolve();
        }, millis);
        return dfr.promise();
    },

    parsex10id: function(id) {
    	var house = id.substr(0,1);
    	var num = parseInt(id.substr(1));
    	return {'house': house, 'num': num };

    }
};

g.drivermap = {};
g.devicemap = {};
g.eventmap = {};
g.delayedactions = {};



// these will live in the database at some point
g.devices = [
	{ name: 'cron', driver: 'cron' }, // system device
	{ name: 'sun', driver: 'sun' }, // system device
    { name: 'curl', driver: 'curl'}, // system device

    { name: 'rfcontroller 1', location: "kitchen", driver: "acrf", id: "H1"},
    { name: 'rfcontroller 5', location: "kitchen", driver: "acrf", id: "H5"},
    { name: 'rfcontroller 6', location: "kitchen", driver: "acrf", id: "H6"},
    { name: 'rfcontroller 7', location: "kitchen", driver: "acrf", id: "H7"},
    { name: 'rfcontroller 8', location: "kitchen", driver: "acrf", id: "H8"},

    // rf motion sensors (hawkeye)
    {name: "hawkeye A3", location: "downstairs", driver: "acrf", id: "A3" },
    {name: "hawkeye A4", location: "porch", driver: "acrf", id: "A4" },
    {name: "hawkeye A6", location: "stairwell", driver: "acrf", id: "A6" },
    {name: "hawkeye A14", location: "kitchen", driver: "acrf", id: "A14" },
    {name: "lightsensor A15", location: "kitchen", driver: "acrf", id: "A15" },

	{name: "downstairs switch 1", location: "downstairs", driver:'ti103',id:'F1'},
	{name: "downstairs switch 2", location: "downstairs", driver:'ti103',id:'F2'},
	{name: "downstairs switch 3", location: "downstairs", driver:'ti103',id:'F3'},
	{name: "downstairs switch 4", location: "downstairs", driver:'ti103',id:'F4'},

    { name: 'Rear 2', location: 'sprinklers', driver: 'ti103', id: 'O5' },
    { name: 'Rear 1', location: 'sprinklers', driver: 'ti103', id: 'O4' },
    { name: 'Lawn 1', location: 'sprinklers', driver: 'ti103', id: 'O1' },
    { name: 'Lawn 2', location: 'sprinklers', driver: 'ti103', id: 'O2' },
    { name: 'Curb', location: 'sprinklers', driver: 'ti103', id: 'O3' },
    { name: 'Mound', location: 'sprinklers', driver: 'ti103', id: 'O6' },
    { name: 'kitchen motion', location: 'kitchen', group:'motion', driver: 'acrf',id:'A14'},
    { name: 'Tiffany Lamp', location: 'upstairs', group:'lights', driver:'ti103',id:'D11'},
	{ name: 'Driveway IR Beam', location: 'downstairs', group:'motion', driver:'ti103',id:'D16'},
    { name: 'kitchen light sensor', location: 'kitchen', group:'motion', driver: 'acrf',id:'A15'},
    { name: 'Rock Light', location: 'outside', group:'lights', driver:'ti103',id:'D6'},

	{ name: 'xmas tree', location: 'kitchen', group:'lights', driver:'ti103',id:'C3'},
    { name: 'flourescents', location: 'kitchen', group:'lights', driver:'ti103',id:'H6'},
    { name: 'porch lights', location: 'outside', group:'lights', driver:'ti103',id:'D7'},
    { name: 'Floor Lamp', location: 'downstairs', group:'lights', driver:'ti103',id:'D10'},
    { name: 'Driveway Lights Motion', location: 'outside', group:'lights', driver:'ti103',id:'E2'},

    { name: 'Doorbell', location: 'outside', group:'motion', driver:'ti103',id:'B6'},
    { name: 'Back Doorbell', location: 'outside', group:'motion', driver:'ti103',id:'B8'},
// fake devices
    {
    name: 'front lights',
    location: 'front',
    group: 'outdoor',
    driver: 'ti103',
    id: 'B1'
    },
    {name: 'thermo',
    location: 'thermostat',
    group: 'thermostat',
    driver: 'rcsx10b', //txb16
    id: 'K'
    },
    {name: 'switchbutton1',
    location: 'kitchen',
    group: 'switches',
    driver: 'ti103',
    id: 'E1'
    },
	{ name:"atticswitchpanel1",location:"attic",driver:'ti103',id: 'F1'},
	{ name:"atticswitchpanel2",location:"attic",driver:'ti103',id: 'F2'},
	{ name:"atticswitchpanel3",location:"attic",driver:'ti103',id: 'F3'},

	// for variables, the id should be the same as the name
	{ name: 'drivewayrx', driver: 'variables', id: 'drivewayrx'},
	{ name: 'virtual test', driver: 'variables', id: 'virtual test'}
];
// min hour day month dayofweek (0-6 Sun-Sat)
g.events = [

// rf events from homeseer, trigger remotely to homeseer
{ name: "remote h1", trigger: 'rfcontroller 1', value:"off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("Arm from Keypad")&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "remote h5", trigger: 'rfcontroller 5', value:"off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("all xmas lights off")&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "remote h6", trigger: 'rfcontroller 6', value:"off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("kitchen controller off")&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "remote h7", trigger: 'rfcontroller 7', value:"off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("bed time")&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "remote h8", trigger: 'rfcontroller 8', value:"off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("upstairs2")&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "remote h5", trigger: 'rfcontroller 5', value:"on", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("kitchen controller h5")&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "remote h6", trigger: 'rfcontroller 6', value:"on", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.TriggerEvent("kitchen light")&runscript=Execute+Command&ref_page=ctrl'}
]},

{ name: "hawkeye a3", trigger: "hawkeye A3", value: "on", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A3",2)&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "hawkeye a3", trigger: "hawkeye A3", value: "off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A3",3)&runscript=Execute+Command&ref_page=ctrl'}
]},

{ name: "hawkeye a4", trigger: "hawkeye A4", value: "on", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A4",2)&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "hawkeye a4", trigger: "hawkeye A4", value: "off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A4",3)&runscript=Execute+Command&ref_page=ctrl'}
]},

{ name: "hawkeye a6", trigger: "hawkeye A6", value: "on", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A6",2)&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "hawkeye a6", trigger: "hawkeye A3", value: "off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A6",3)&runscript=Execute+Command&ref_page=ctrl'}
]},

{ name: "hawkeye a14", trigger: "hawkeye A14", value: "on", actions: [
    { do: 'speak', value: 'motion now'},
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A14",2)&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "hawkeye a14", trigger: "hawkeye A14", value: "off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A14",3)&runscript=Execute+Command&ref_page=ctrl'}
]},

{ name: "hawkeye a15", trigger: "lightsensor A15", value: "on", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A15",2)&runscript=Execute+Command&ref_page=ctrl'}
]},
{ name: "hawkeye a15", trigger: "lightsensor A15", value: "off", actions: [
    { do: "device", name: "curl", value: "POST",
        parm: 'http://192.168.0.99:82 scriptcmd=hs.setDeviceStatus("A15",3)&runscript=Execute+Command&ref_page=ctrl'}
]},

// test actions
{ name: "hourly chime" , trigger: "cron", value: "0/30 * * * *", actions:[
    { do: 'speak', value: 'every quarter hour'}
]},
{ name: "handle switch1", trigger: 'downstairs switch 1', actions: [
	{ do: 'event', name: 'cascade', delay: "1min"},
	{ do: 'speak', value: 'switch 1 actions'},
	{ do: 'device', name: 'virtual test', value: 'set', parm: 'end switch 1'}
]},
{ name: "cascade", actions: [
	{ do: 'speak', value: 'running cascade now'},
	{ do: 'device', name: 'virtual test', value: 'set', parm: 'end cascade', delay: "2min"}
]}
];
/*

{ name: 'bedtime dingding', actions: [
    { do: 'device', name: "thermo", value: "setheat", parm: "60"},
    { do: 'device', name: "thermo", value: "setcool", parm: "75"},
    { do: 'device', name: "porchlight", value: "off", delay: "120min"},
    ]
},
{ name: 'doorbell', trigger: "atticswitchpanel1", value:"on", actions: [
    { do: 'event', name: 'bedtime dingding'},
    { do: 'device', name: 'front lights', value: 'on'},
    { do: 'speak', name: 'time for bed'}
    ]
},
{ name : 'ev1', trigger: 'switchbutton1', value: 'on', actions: [
    { do: 'device', name: 'front lights', value: 'on'},
    { do: 'event', name: 'bedtime dingding'}
    ]
},
{ name: 'ev2', trigger: 'Driveway IR Beam', value: 'on', actions: [
    { do: 'speak', name: 'ding ding'},
    { do: 'device', name: 'drivewayrx', value: 'set', parm: 'true'},
    { do: 'device', name: 'drivewayrx', value: 'set', parm: 'false', delay: '10min'}
    ]
},
{ name: 'ev3', trigger: 'cron', value: '0 7 * * mon,wed,fri', actions: [
    { do: 'device', name: 'front sprinkler 1', value: 'on', delay: '0min'},
    { do: 'device', name: 'front sprinkler 1', value: 'off', delay: '15min'},
    { do: 'device', name: 'front sprinkler 2', value: 'on', delay: '16min'},
    { do: 'device', name: 'front sprinkler 2', value: 'off', delay: '30min'},
    { do: 'device', name: 'front sprinkler mound', value: 'on', delay: '31min'},
    { do: 'device', name: 'front sprinkler mound', value: 'off', delay: '46min'}
    ]
},
{ name: 'ev3', trigger: 'sun', value: 'set', actions: [
    { do: 'device', name: 'security lights', value: 'on', delay: '15min'}

    ]
}
];
*/


if (!String.prototype.hasOwnProperty("endsWith")) {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (!String.prototype.hasOwnProperty("startsWith")) {
    String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix) === 0;
    };
}


module.exports = g;

