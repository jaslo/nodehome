
var g = require("./globals");

function db() {
var self = this;

this.loadDevices = function() {
	for (var i in self.devices) {
		var d = self.devices[i];
		g.devicemap[d.name] = d;
	}
};

g.ti103initialize = "192.168.0.143:2001";
//    ti103init: '/dev/ttyUSB0,{ "baudrate": 9600 }',
//    acrf2init: "/dev/nul",
//g.acrfinitialize = '/dev/ttyUSB1,{ "baudrate": 4800 }';
g.acrfinitialize = 'COM7,{ "baudrate": 4800 }';

// these are numbered to run after the "base interface" initialization above

g.rcsx10binitialize1 = "ti103,K";
g.keypadinitialize1 = "ti103,H";

// these will live in the database at some point
this.devices = [
	{ name: 'cron', driver: 'cron', location:'system', id:'cron' }, // system device
	{ name: 'sun', driver: 'sun' , location:'system', id:'sun'}, // system device
    { name: 'curl', driver: 'curl', location:'system',id:'curl'}, // system device
    { name: 'homeseerpost', driver: 'homeseerpost', location:'system',id:'homeseerpost'},

    { name: 'thermo', driver: 'rcsx10b', location:'thermo', id:'ti103,K'},

    { name: 'rfcontroller 1', location: "kitchen", driver: "acrf", id: "H1"},
    { name: 'rfcontroller 5', location: "kitchen", driver: "acrf", id: "H5"},
    { name: 'rfcontroller 6', location: "kitchen", driver: "acrf", id: "H6"},
    { name: 'rfcontroller 7', location: "kitchen", driver: "acrf", id: "H7"},
    { name: 'rfcontroller 8', location: "kitchen", driver: "acrf", id: "H8"},

    // rf motion sensors (hawkeye)
    {name: "hawkeye A3", location: "downstairs", driver: "acrf", id: "A3" },
    {name: "hawkeye A4", location: "porch", driver: "acrf", id: "A4" },
    {name: "hawkeye A6", location: "stairwell", driver: "acrf", id: "A6" },
    {name: "kitchen motion", location: "kitchen", driver: "acrf", id: "A14" },
    {name: "kitchen light sensor", location: "kitchen", driver: "acrf", id: "A15" },

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

    { name: 'Tiffany Lamp', location: 'upstairs', group:'lights', driver:'ti103',id:'D11'},
	{ name: 'Driveway IR Beam', location: 'downstairs', group:'motion', driver:'ti103',id:'D16'},
    { name: 'Rock Light', location: 'outside', group:'lights', driver:'ti103',id:'D6'},

	{ name: 'xmas tree', location: 'outside', group:'lights', driver:'ti103',id:'C3'},
    { name: 'flourescents', location: 'kitchen', group:'lights', driver:'ti103',id:'H6'},
    { name: 'porch lights', location: 'outside', group:'lights', driver:'ti103',id:'D7'},
    { name: 'Floor Lamp', location: 'downstairs', group:'lights', driver:'ti103',id:'D10'},
    { name: 'Driveway Lights Motion', location: 'outside', group:'lights', driver:'ti103',id:'E2'},

    { name: 'Front Door', location: 'outside', group:'motion', driver:'ti103',id:'B6'},
    { name: 'Back Doorbell', location: 'outside', group:'motion', driver:'ti103',id:'B8'},

    { name: 'Back door', location: 'kitchen', group: 'motion', driver: 'ti103', id: 'B2'},

    { name: 'Couch Light', location: 'downstairs', driver:'ti103',id:'D8'},
    { name: 'bugzapper', location: 'outside', driver:'ti103',id:'D9'},

// fake devices
 
	// for variables, the id should be the same as the name
	{ name: 'drivewayrx', driver: 'variables', id: 'drivewayrx'},
	{ name: 'virtual test', driver: 'variables', id: 'virtual test'},
	{ name: "arm state", driver: "variables", id: "Z6"}
];

// for motion/alarm
/*
    if (this is a motion trigger ) gotAlarm - true

    if gotalarm and alarm == armed then {
        // motion while armed
        alarm = counting
        nret = warning countdown
        devalarm = "off"
        device H16 = 2
        if (nret code entered return)
        else {
            console (disarmed)
            event "InDoor"
            vnext = ""
        }
    }
    elseif vlast == vthis {
        vthis.lastchange = now
    }
    else {
        if (vlast.lastchange - now  < 2 minutes) {
            if (vthis == a14)
                if vlast == b2 (door)
                    writelog("indoor")
                endif
            else if vthis == b2
                if vlast = 14
                    wr        var splits = initparm.split(",");
        var x10driver =  splits[0];
        var housecode = splits[1];
        console.log("x10driver is " + x10driver);
 itelog("outdoor")
                else
                    vnext = vthis
                end if
            else if !gotalarm
                writelog("unexpected vthis")
            end if
        }
        else {
            vnext = vthis;
        }
    }
    vlast = vnext
*/

// for cron: min hour day month dayofweek (0-6 Sun-Sat)

// {name: "arm state", device: "variables", id: "Z6"}

this.events = [
/*{ name: "Arm from Keypad", actions: [
    { do: "speak", value: 'arming'},
    { do: "device", name: "homeseerpost", value: 'TriggerEvent("unoccupied thermostat")'},
	{ do: "device", name: "arm state", value:"arming"},
    { do: "speak", value: 'System arming'}
]},
*/
{ name: "unoccupied thermostat", nolog: false, actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'TriggerEvent("unoccupied thermostat")'}
	//{ do: "device", name: "homeseerpost", value: 'TriggerEvent("unoccupied thermostat")'}
]},
{ name: "all xmas lights off", actions: [
    { do: "device", name: "xmas tree", value: 'off'}
]},

// rf events from homeseer, trigger remotely to homeseer
{ name: "remote h1", trigger: 'rfcontroller 1', value:"off", actions: [
    { do: "device", name: "homeseerpost", value: 'TriggerEvent("Arm from Keypad")'}
]},
{ name: "remote h5", trigger: 'rfcontroller 5', value:"off", actions: [
    { do: "device", name: "xmas tree", value: 'off'}
//    { do: "device", name: "homeseerpost", value: 'TriggerEvent("all xmas lights off")'}
]},
//{ name: "remote h6", trigger: 'rfcontroller 6', value:"off", actions: [
//    { do: "device", name: "flourescents", value: 'off'}
//]},
{ name: "Lights out bedtime", actions: [
	{ do: "device", name: "Floor Lamp", value: 'off', delay: '5min'},
	{ do: "device", name: "Couch Light", value: 'off'},
	{ do: "device", name: "flourescents", value: 'off', delay: '10min'},
	{ do: "device", name: "bugzapper", value: 'off'},
	{ do: "event", name: "all xmas lights off"},
	{ do: "event", name: "unoccupied thermostat"}
]},
{ name: "Upstairs lights out", actions: [
	{ do: "device", name: "Tiffany Lamp", value: 'off'},
	{ do: "device", name: "porch lights", value: 'off'},
]},
{ name: "remote h7", trigger: 'rfcontroller 7', value:"off", actions: [
    { do: "event", name: "Lights out bedtime"}
]},
{ name: "remote h8", trigger: 'rfcontroller 8', value:"off", actions: [
    { do: "event", name: "Upstairs lights out"}
]},
{ name: "remote h5", trigger: 'rfcontroller 5', value:"on", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'TriggerEvent("kitchen controller h5")'}
]},
//{ name: "remote h6", trigger: 'rfcontroller 6', value:"on", actions: [
//	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'TriggerEvent("kitchen light")'}
//]},

{ name: "hawkeye a3", trigger: "hawkeye A3", value: "on", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A3",2)'}
]},
{ name: "hawkeye a3", trigger: "hawkeye A3", value: "off", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A3",3)'}
]},

{ name: "hawkeye a4", trigger: "hawkeye A4", value: "on", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A4",2)'}
]},
{ name: "hawkeye a4", trigger: "hawkeye A4", value: "off", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A4",3)'}
]},

{ name: "hawkeye a6", trigger: "hawkeye A6", value: "on", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A6",2)'}
]},
{ name: "hawkeye a6", trigger: "hawkeye A3", value: "off", actions: [
	{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A6",3)'}
]},

{ name: "hawkeye a14", trigger: "kitchen motion", value: "on", nolog: true, actions: [
    { do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A14",2)'}
]},
{ name: "hawkeye a14", trigger: "kitchen motion", value: "off", nolog: true, actions: [
    { do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A14",3)'}
]},

{ name: "hawkeye a15", trigger: "kitchen light sensor", value: "on", actions: [
    { do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A5",2)'}
]},
{ name: "hawkeye a15", trigger: "kitchen light sensor", value: "off", actions: [
    { do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A5",3)'}
]},
{name: "thermo on", actions: [
    {do: "device", name: "thermo", value: 'fanon'}
]},
{name: "thermo auto", actions: [
    {do: "device", name: "thermo", value: 'fanauto'}
]},

{name: "thermo cool", actions: [
    {do: "device", name: "thermo", value: 'coolpoint', parm: 71}
]},

{name: "kitchen from switch on", trigger: "downstairs switch 1", value: "on", actions: [
	{ do: "device", name: "flourescents", value: 'on'}
]},

{name: "kitchen from switch on", trigger: "downstairs switch 1", value: "off", actions: [
	{ do: "device", name: "flourescents", value: 'off'}
]},

//{ name: "test lights on" , trigger: "cron", value: "*/5 * * * *", actions:[
//    { do: "device", name: "flourescents", value: 'off'},
//]},
//{ name: "test device" , trigger: "cron", value: "2,7,12,17,22,27,32,37,42,47,52,57 * * * *", actions:[
//    { do: "device", name: "flourescents", value: 'on'},
//]},

//{ name: "Evening Lights On", trigger: "sun", value:"set-1:00", actions:[
{ name: "Evening Lights On", trigger: "sun", value:"set", actions:[
	{do: "device", name: "Floor Lamp", value: "on"},
	{do: "device", name: "flourescents", value: "on"},
	{do: "device", name: "bugzapper", value: "on"},
	{do: "device", name: "Rock Light", value: "on", delay: "30min"},
	{do: "device", name: "Tiffany Lamp", value: "on", delay: "0:05"},
	{do: "device", name: "xmas tree", value: "on", delay: "20min"},
	{do: "device", name: "porch lights", value: "on"}
]},

{ name: "Evening Lights Out", trigger: "cron", value:"0 20 * * * *", actions:[
	{do: "device", name: "Tiffany Lamp", value: "off", delay: "2:00"},
]}
];

}

module.exports = new db();
