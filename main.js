

// load interfaces table

// listen for events on interfaces
//
// set up delayed action table

// some "special" interfaces
var Deferred = require("JQDeferred"),
	http = require("http"),
	app = require("./app"),
	xpath = require("xpath"),
	db = require("./dbdata"),
	g = require("./globals");


var speech = null;
// flitespeak is nice for ubuntu, but it's loud!
//speech = require("./speech/flitespeak.js");

//speech = require("./speech/espeak.js");

// no cepstral except on rpi
//speech = require("./speech/cepstral.js");

var sun = require("./plugins/sunInterface.js");
sun.initialize("San Jose, Calif.");

// driver table entry
// name: drivername
// obj: driver obj
// idtype: x10, string, none
// cmds: [...]
// events: [...]
//
// driver entry points
// obj.set(id, val) (action)
// obj.subscribe(id, val?, cb) (trigger)
// obj.get(id) (action??)

function getDeviceInfo(devname) {
	var driverentry = null;
	var device = null;
	if (devname) {
	    device = g.devicemap[devname];
	    if (device && device.driver) {
	    	// now lookup driver
	    	driverentry = g.drivermap[device.driver];
		}
        if (!device) {
            g.log(g.LOG_ERROR,"no device: " + devname);
        }
	}
	if (!driverentry) {
		g.log(g.LOG_ERROR,"driver for " + devname + " not found: ");
	}

   	return {driver: driverentry, 'device': device};
}

function checkEventActions(e) {
	for (var i1 = 0; i1 < e.actions.length; i1++) {
		var a = e.actions[i1];
		if (a.delay) {
			var ms = delayInMs(a.delay);
			if (ms == 0) {
				g.log(g.LOG_WARNING, "Event " + e.name + ", action " + i1 + " invalid delay");
			}
		}
		if (a.do == 'device') {
			getDeviceInfo(a.name);
		}
		else if (a.do == 'event') {
			// too early to check these :(
		}
	}
}

// globally accessible to app.js
g.runEventActions = function(e) {
    e.latest = new Date();
	// run the event actions
	for (var i1 in e.actions) {
		var a = e.actions[i1];
		if (a.delay) {
			var ms = delayInMs(a.delay);
            //TODO: track all the currently "delayed" actions
            var da = g.delayedactions[a.name];
            if (da) {
                g.log(g.LOG_TRACE,"replacing delayed action");
                clearTimout(da.timeout);
            }
			var to = setTimeout((function(a) {
				return function() { 
                    delete g.delayedactions[a.name];
                    executeAction(a); 
                };
			})(a), ms);
            g.delayedactions[a.name] = {act: a, timeout: to};
		}
		else executeAction(a);
	}
}


function delayInMs(del) {
	var n = parseInt(del);
	var ms = 0;
	if (del.indexOf(':') != -1) {
        // [hh:][mm:][ss][.ms]

	}
	else if (del.endsWith("sec")) {
		ms = n * 1000;
	}
	else { // assume minutes
		ms = n * 60 * 1000;
	}
	return ms;
}

function actionToText(a) {
	var text = "";
	switch (a.do) {
		case 'device':
			text = a.name + " set " + a.value + (a.parm ? "(" + a.parm + ")" : "");
			break;
		case 'event':
			text = "run " + a.name;
			break;
		case 'speak':
			text = "speak " + a.value;
			break;
	}
	return text;
}

// delay if present is already handled
function executeAction(a) {
	g.log(g.LOG_TRACE,"action=>" + actionToText(a));
	switch (a.do) {
		case 'device':
			var devinfo = getDeviceInfo(a.name);
            devinfo.device.latest = new Date();
            if (typeof(devinfo.device.id) != "string") {
                g.log(g.LOG_ERROR, "bad device for " + a.name);
            }
            devinfo.driver.obj.publish(devinfo.device.id, a.value);
			devinfo.driver.obj.set(devinfo.device.id, a.value, a.parm);
			break;
		case 'event':
            //TODO: error if not exists?
			g.runEventActions(g.eventmap[a.name]);
			break;
		case 'speak':
            if (speech) {
                speech.say(a.value);
            }
			g.log(g.LOG_TRACE,"speaking: " + a.value);
			break;
	}
}

//
// load drivers and build "drivers" table
//
g.log(g.LOG_TRACE,"loading drivers:");
var fs = require("fs");
var pluginfiles = fs.readdirSync("plugins");
var initdrivers = [];
for (var i in pluginfiles) {
    var p = pluginfiles[i];
    if (p.endsWith(".js")) {
    	var d1;
    	try {
    		d1 = require('./plugins/' + p);
    		if (d1.driver) {
    			d1.driver.obj = d1;
    			g.drivermap[d1.driver.name] = d1.driver;
    			g.log(g.LOG_TRACE,"got driver: " + d1.driver.name);
                // check for a driver init param
                var namepart = d1.driver.name; // p.substring(0,p.length-3); // cut off .js
                if (g[namepart + "init"] && d1.initialize) {
                	initdrivers.push(d1);
                }

    		}
    	}
    	catch (ex) {
    		g.log(g.LOG_TRACE,"exception " + ex);
    	}
    }
}
for (var i = 0; i < 10; i++) {
	var method = "initialize" + (i > 0 ? i : "");
	for (var j in g.drivermap) {
		var d1 =  g.drivermap[j].obj;
		var p = g[d1.driver.name + method];
		if (p && typeof(d1[method]) == "function")  {
			d1[method](p);
		}
	}
}
/*
for (var i = 0; i < initdrivers.length; i++) {
	var d1 = initdrivers[i];
	d1.initialize(g[d1.driver.name + "init"]);
}
*/
// read devices into g.devicemap
// TODO: switch to database, not g.devices
//devicemap[name] = name:,location,driver,id,group,latest

g.log(g.LOG_TRACE,"loading devices:");
db.loadDevices();

g.log(g.LOG_TRACE,"loading events");
//TODO: add event fields for disabled/logged
// read events, do all subscribes
//eventmap[e.name] = {name,trigger,value, actions[]}
// action = { do, name, value, parm, delay, text}
for (var i in db.events) {
    var e = db.events[i];
    checkEventActions(e);
    for (var ai in e.actions) {
        e.actions[ai].text = actionToText(e.actions[ai]);
    }
    g.eventmap[e.name] = e;
    var devname = e.trigger;
    if (devname && devname != "none") {
        var devinfo = getDeviceInfo(devname);
        if (!devinfo) {
            g.log(g.LOG_TRACE,"Error on event " + e.name + ". No device " + devname + ".");
        }
        devinfo.driver.obj.subscribe(devinfo.device.id,e.value, (function(e) {
            return function() {
                g.runEventActions(e);
            }
        })(e));
    }
}

app.listen(82);

