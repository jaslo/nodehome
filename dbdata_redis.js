var redis = require("redis"),
    Q = require("q"),
    g = require("./globals");

g.ti103initialize = ""; //"192.168.0.143:2001"; // 9600
//    ti103init: '/dev/ttyUSB0,{ "baudrate": 9600 }',
//    acrf2init: "/dev/nul",
g.acrfinitialize = ""; // '/dev/ttyUSB0,{ "baudrate": 4800 }';
//g.acrfinitialize = 'COM7,{ "baudrate": 4800 }';

// these are numbered to run after the "base interface" initialization above

g.rcsx10binitialize1 = "ti103,K";
g.keypadinitialize1 = "ti103,H";


function db() {
    var self = this;
    var client;

    function connected() {
    	console.log("got connection");
    }
  

    this.init = function() {
        client = redis.createClient();
        client.config("set","appendonly","yes");
        client.on("connect",connected);
        setBindings();
    }


    function setBindings() {
		self.allDevices  = Q.nbind(client.keys, client, "device:*");
		self.allEvents = Q.nbind(client.keys, client, "event:*");
		self.addObject = Q.nbind(client.hmset,client);
		self.getObject = Q.nbind(client.hgetall,client);
    }

    //client.hmset("device:cron","driver","cron","location","system","id","cron");
    //client.hmset("device:downstairs motion","driver","acrf","location","downstairs","id","A3");

    function getDeviceField(dev,field) {
        return Q.nbind(client.hget, client, "event:" + dev, field)();
    }

    this.loadDevices = function() {
        var dfr = Q.defer();

        self.allDevices().then(function(dat) {
            for (var i in dat) {
                var k = dat[i];
                client.del(k);
            }
            var dfrs = [];
            for (var i in self.devices) {
                var d = self.devices[i];

                dfrs.push(self.addObject("device:" + d.name, d));
            }
            Q.all(dfrs)
            .then(function() {
            	return self.allDevices();
            })
            .then(function(devs) {
                dfr.resolve(devs);
            });
        });
        return dfr.promise;
    }

    this.saveAction = function(e,aindex) {
		return self.addObject("event:" + e.name + ":action:" + aindex,e.actions[aindex]);
    }

    this.saveEvent = function(e) {
		return self.addObject("event:" + e.name,e);
    }

    this.saveDevice = function(e) {
		return self.addObject("device:" + e.name,e);
    }

    this.allEventsActions = function() {
    	var d1 = Q.defer();
    	var dfr = [];
    	self.allEvents().then(function(evs) {
    		for (var i = 0; i < evs.length; i++) {
                var e = evs[i];
                for (var j = 0; j < e.actionsLength; j++) {
                	dfrs.push(self.action(e,j));
                	if (i+1 == evs.length && j+1 = e.actionsLength) {
                		Q.all(dfrs).then(function() { d1.resolve(evs); })
                	}
                }
            }
    	});
    	return d1.promise;
    }

    this.device = function(dname) {
    	return self.getObject("device:" + dname);
    }

    this.event = function(ename) {
    	return self.getObject(ename);
    }

    this.action = function(e,aindex) {
    	return self.getObject("event:" + e.name + ":action:" + aindex).then(function(a) {
    		e.actions = e.actions || [];
    		e.actions[aindex] = a;
    		return Q(a);
    	});
    }

    this.saveDelayedAction = function(name, obj) {
    	return self.addObject("delayed:" + name, obj);
    }

    this.delayedAction = function(name) {
    	return self.getObject("delayed:" + name);
    }

    this.loadEvents = function() {
        var dfr = Q.defer();
        self.allEvents().then(function(dat) {
            for (var i in dat) {
                var k = dat[i];
                client.del(k);
            }
            var dfrs = [];
            var d1 = Q.defer();
            // load from static table self.events
            for (var i = 0; i < self.events.length; i++) {
            	(function(i) {
	                var d = self.events[i];
	                self.getObject("device:"+d.trigger)
	                .done(function(dev) {

		                // must bust out the actions
		                for (var j = 0; j < d.actions.length; j++) {
		                	dfrs.push(self.saveAction(d,j));
		                }
	                	d.actionslength = d.actions.length;  // save the length!
	                	delete d.actions;
	                	dfrs.push(self.addObject("event:" + d.name, d));
		                //TODO check event object d against existing devices

		                if (i+1 == self.events.length) {
	                		Q.all(dfrs).then(function() { d1.resolve(); });
	                	}
		            });
		        })(i);
//	            .fin(function() {
  //  	        });
            }
            d1.promise
            .then(function() {
            	return self.allEvents();
            })
            .then(function(evs) {
                dfr.resolve(evs);
            });
        });
        return dfr.promise;
    }

    // these will live in the database at some point
    this.devices = [
        { name: 'cron', driver: 'cron', location:'system', id:'cron' }, // system device
        { name: 'sun', driver: 'sun' , location:'system', id:'sun'}, // system device
        { name: 'curl', driver: 'curl', location:'system',id:'curl'}, // system device
        { name: 'homeseerpost', driver: 'homeseerpost', location:'system',id:'homeseerpost'},
        { name: 'keypad', driver: 'keypad', location: 'system', id: 'keypad'},

        { name: 'thermo', driver: 'rcsx10b', location:'thermo', id:'ti103,K'},

        { name: 'rfcontroller 1', location: "kitchen", driver: "acrf", id: "H1"},
        { name: 'rfcontroller 5', location: "kitchen", driver: "acrf", id: "H5"},
        { name: 'rfcontroller 6', location: "kitchen", driver: "acrf", id: "H6"},
        { name: 'rfcontroller 7', location: "kitchen", driver: "acrf", id: "H7"},
        { name: 'rfcontroller 8', location: "kitchen", driver: "acrf", id: "H8"},

        // rf motion sensors (hawkeye)
        {name: "downstairs motion", location: "downstairs", driver: "acrf", id: "A3" },
        {name: "hawkeye A4", location: "porch", driver: "acrf", id: "A4" },
        {name: "stairwell motion", location: "stairwell", driver: "acrf", id: "A6" },
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

        // for variables, the id should be the same as the name
        { name: 'drivewayrx', driver: 'variables'},
        { name: 'virtual test', driver: 'variables'},
        { name: "arm state", driver: "variables"},
        { name: "devlast", driver: "variables"}
    ];

    // for cron: sec min hour day month dayofweek (0-6 Sun-Sat)

    // {name: "arm state", device: "variables", id: "Z6"}

    this.events = [

    /////////////////////////////
    // these events are the security alarm
    { name: "back door switch", trigger: "Back door", value: "on", actions: [
        {do: "script", name: "backdoor", value:"run", parm: "Back door"},
        {do: "device", name: "Back door", value:"off"}
    ]},

    // rf events from homeseer, trigger remotely to homeseer
    { name: "arm from keypad", trigger: 'rfcontroller 1', value:"off", actions: [
    //    { do: "script", name: "homeseerpost", value:"Post", parm: 'TriggerEvent("Arm from Keypad")'},
        { do: "device", name: "arm state", value: "arming"},
        { do: "speak", value: "arming"}
    ]},

    { name: "driveway ir", trigger: 'Driveway IR Beam', value: "on", actions: [
        { do: "device", name: "Driveway IR Beam", value: "off"},
        { do: "play", name: "ding.wav"},
        { do: "speak", value: "driveway"},
        { do: "script", name: "driveway", value: "Run" }
    ]},

    { name: "hawkeye a14", trigger: "kitchen motion", value: "on", nolog: true, actions: [
    //    { do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A14",2)'},
        {do: "script", name: "backdoor", value:"run", parm: "kitchen motion"},
    ]},

    { name: "downstairs motion", trigger: "downstairs motion", value: "on", nolog: true, actions: [
        {do: "script", name: "backdoor", value:"run", parm: "downstairs motion"},
    ]},

    { name: "stairwell motion", trigger: "stairwell motion", value: "on", nolog: true, actions: [
        {do: "script", name: "backdoor", value:"run", parm: "stairwell motion"},
    ]},

    //////////////////////////////////////////

    { name: "hawkeye a14", trigger: "kitchen motion", value: "off", nolog: true, actions: [
        //{ do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A14",3)'}
    ]},

    { name: "unoccupied thermostat", nolog: false, actions: [
        { do: "script", name: "homeseerpost", value: 'Post', parm: 'TriggerEvent("unoccupied thermostat")'}
        //{ do: "device", name: "homeseerpost", value: 'TriggerEvent("unoccupied thermostat")'}
    ]},
    { name: "all xmas lights off", actions: [
        { do: "device", name: "xmas tree", value: 'off'}
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
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'TriggerEvent("kitchen controller h5")'}
    ]},
    //{ name: "remote h6", trigger: 'rfcontroller 6', value:"on", actions: [
    //  { do: "script", name: "homeseerpost", value: 'Post', parm: 'TriggerEvent("kitchen light")'}
    //]},

    { name: "hawkeye a3", trigger: "downstairs motion", value: "on", actions: [
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A3",2)'}
    ]},
    { name: "hawkeye a3", trigger: "downstairs motion", value: "off", actions: [
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A3",3)'}
    ]},

    { name: "hawkeye a4", trigger: "hawkeye A4", value: "on", actions: [
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A4",2)'}
    ]},
    { name: "hawkeye a4", trigger: "hawkeye A4", value: "off", actions: [
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A4",3)'}
    ]},

    { name: "hawkeye a6", trigger: "stairwell motion", value: "on", actions: [
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A6",2)'}
    ]},
    { name: "hawkeye a6", trigger: "stairwell motion", value: "off", actions: [
        //{ do: "script", name: "homeseerpost", value: 'Post', parm: 'setDeviceStatus("A6",3)'}
    ]},

    { name: "hawkeye a15", trigger: "kitchen light sensor", value: "on", actions: [
        //{ do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A15",2)'}
    ]},
    { name: "hawkeye a15", trigger: "kitchen light sensor", value: "off", actions: [
        //{ do: "script", name: "homeseerpost", value: "Post", parm: 'setDeviceStatus("A15",3)'}
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

    { name: "Evening Lights Out", trigger: "cron", value:"0 0 20 * * *", actions:[
        {do: "device", name: "Tiffany Lamp", value: "off", delay: "2:00"},
    ]},

    { name: "security ligts off dawn", trigger: "sun", value:"rise", actions:[
        {do: "device", name: "Rock Light", value: "off", delay: "1:00:00"},
        {do: "device", name: "porch lights", value: "off", delay: "1:00:00"}
    ]},


    ];
}

module.exports = new db();

