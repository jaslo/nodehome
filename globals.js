var path = require("path"),
    argv = require("optimist").argv,
    cluster = require("cluster"),
    Deferred = require("JQDeferred");

var g = {

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

// these will live in the database at some point
g.devices = [
	{ name: 'cron', driver: 'cron' }, // system device
	{ name: 'sun', driver: 'sun' }, // system device

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

	{ name: 'drivewayrx', driver: 'virtual', id: 'drivewayrx'},
];

g.events = [
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

