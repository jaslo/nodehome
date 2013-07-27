

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



var temptest = require("./plugins/ti103");

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
var drivermap = {};
var devicemap = {};
var eventmap = {};

function getDeviceInfo(devname) {
	var driverentry = null;
	var device = null;
	if (devname) {
	    device = devicemap[devname];
	    if (device && device.driver) {
	    	// now lookup driver
	    	driverentry = drivermap[device.driver];
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
			setTimeout(function() {
				executeAction(a);
			}, ms);
		}
		else executeAction(a);
	}
}


function delayInMs(del) {
	var n = parseInt(del);
	var ms = 0;
	if (del.indexOf(':')) {

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
			text = "speak " + a.name;
			break;
	}
	return text;
}

// delay if present is already handled
function executeAction(a) {
	console.log(actionToText(a));
	switch (a.do) {
		case 'device':
			var devinfo = getDeviceInfo(a.name);
            devinfo.device.latest = new Date();
            devinfo.driver.publish(devinfo.device, a.value);
			devinfo.driver.set(devinfo.device, a.value, a.parm);
			break;
		case 'event':
			runEventActions(a.name);
			break;
		case 'speak':
			break;
	}
}

//
// load drivers and build "drivers" table
//
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
    			drivermap[d1.driver.name] = d1.driver;
    			console.log("got driver: " + d1.driver.name);
    		}
    	}
    	catch (ex) {
    		console.log("exception " + ex);
    	}
    }
}

// read devices into devicemap
// TODO: switch to database, not g.devices
for (var i in g.devices) {
	var d = g.devices[i];
	devicemap[d.name] = d;
}

// read events, do all subscribes
for (var i in g.events) {
	var e = g.events[i];
	eventmap[e.name] = e;
	var devname = e.trigger;
	if (devname && devname != "none") {
		var devinfo = getDeviceInfo(devname);
	    devinfo.driver.obj.subscribe(devinfo.device.id,e.value, function() {
	    	runEventActions(e);
	    });
	}
}

app.listen(82);

