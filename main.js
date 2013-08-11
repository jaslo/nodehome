

// load interfaces table

// listen for events on interfaces
//
// set up delayed action table

// some "special" interfaces
var Deferred = require("JQDeferred"),
	http = require("http"),
	app = require("./app"),
	xpath = require("xpath"),
	g = require("./globals");


var speech = null;
//speech = require("./speech/flitespeak.js");
//speech = require("./speech/espeak.js");
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
	}
	if (!driverentry) {
		console.log("driver for " + devname + " not found");
	}

   	return {driver: driverentry, device: device};
}

function runEventActions(e) {
    e.latest = new Date();
	// run the event actions
	for (var i1 in e.actions) {
		var a = e.actions[i1];
		if (a.delay) {
			var ms = delayInMs(a.delay);
            //TODO: track all the currently "delayed" actions
            var da = g.delayedactions[a.name];
            if (da) {
                console.log("replacing delayed action");
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
	console.log("action=>" + actionToText(a));
	switch (a.do) {
		case 'device':
			var devinfo = getDeviceInfo(a.name);
            devinfo.device.latest = new Date();
            devinfo.driver.obj.publish(devinfo.device, a.value);
			devinfo.driver.obj.set(devinfo.device, a.value, a.parm);
			break;
		case 'event':
            //TODO: error if not exists?
			runEventActions(g.eventmap[a.name]);
			break;
		case 'speak':
            if (speech) {
                speech.say(a.value);
            }
			console.log("speaking: " + a.value);
			break;
	}
}

//
// load drivers and build "drivers" table
//
console.log("loading drivers:");
var fs = require("fs");
var pluginfiles = fs.readdirSync("plugins");
for (var i in pluginfiles) {
    var p = pluginfiles[i];
    if (p.endsWith(".js")) {
    	var d1;
    	try {
    		d1 = require('./plugins/' + p);
    		if (d1.driver) {
    			d1.driver.obj = d1;
    			g.drivermap[d1.driver.name] = d1.driver;
    			console.log("got driver: " + d1.driver.name);
                // check for a driver init param
                var namepart = p.substring(0,p.length-3); // cut off .js
                if (g[namepart + "init"] && d1.initialize) {
                    d1.initialize(g[namepart + "init"]);
                }

    		}
    	}
    	catch (ex) {
    		console.log("exception " + ex);
    	}
    }
}

// read devices into g.devicemap
// TODO: switch to database, not g.devices
//devicemap[name] = name:,location,driver,id,group,latest

console.log("loading devices:");
for (var i in g.devices) {
	var d = g.devices[i];
	g.devicemap[d.name] = d;
}

console.log("loading events");
//TODO: add event fields for disabled/logged
// read events, do all subscribes
//eventmap[e.name] = {name,trigger,value, actions[]}
// action = { do, name, value, parm, delay, text}
for (var i in g.events) {
    var e = g.events[i];
    for (var ai in e.actions) {
        e.actions[ai].text = actionToText(e.actions[ai]);
    }
    g.eventmap[e.name] = e;
    var devname = e.trigger;
    if (devname && devname != "none") {
        var devinfo = getDeviceInfo(devname);
        devinfo.driver.obj.subscribe(devinfo.device.id,e.value, (function(e) {
            return function() {
                runEventActions(e);
            }
        })(e));
    }
}

app.listen(82);

