var Q = require("q"),
	http = require("http"),
	app = require("./app"),
	xpath = require("xpath"),
	db = require("./dbdata"),
	player = require("./wavplayer"),
	_ = require("underscore"),
	g = require("./globals");

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

function evactions() {
	var self = this;

var speech = null;
// flitespeak is nice for ubuntu, but it's loud!
//speech = require("./speech/flitespeak.js");

//speech = require("./speech/espeak.js");
// available for windows


// no cepstral except on rpi
speech = require("./speech/cepstral.js");


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

	// globally accessible to app.js
	g.runEventActions = function(e) {
		var dolog = !e || (!e.nolog);
		if (dolog) g.log(g.LOG_TRACE,"event=>" + e.name);
	    e.latest = new Date();
		// run the event actions
		for (var i1 in e.actions) {
			var a = e.actions[i1];
			if (a.delay) {
				var ms = g.delayInMs(a.delay);
	            //TODO: track all the currently "delayed" actions
                // persist these!!!!
	            var da = g.delayedactions[a.name];
	            if (da) {
	                g.log(g.LOG_TRACE,"replacing delayed action " + a.name);
	                clearTimeout(da.timeout);
	            }
				var to = setTimeout((function(a) {
					return function() {
	                    delete g.delayedactions[a.name];
	                    g.executeAction(a, e);
	                };
				})(a), ms);
	            g.delayedactions[a.name] = {act: a, timeout: to};
			}
			else g.executeAction(a, e);
		}
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
			case 'script':
				text = a.name + "." + a.value + "(" +a.parm + ")";
				break;
			case 'play':
				text = "play " + a.name;
				break;
		}
		return text;
	}

	this.DeviceAction = function(a, toDevice) {
		var devinfo = getDeviceInfo(a.name);
		var now = new Date();
        devinfo.device.latest = now;
        if (typeof(devinfo.device.id) != "string") {
            g.log(g.LOG_ERROR, "bad device for " + a.name);
        }
        g.devicemap[a.name].latest = now;
        g.devicemap[a.name].state = a.value;

        if (toDevice) {
        	devinfo.driver.obj.publishEvent(devinfo.device.id, a.value);
        	g.log(g.LOG_DIAGNOSTIC, "set " + devinfo.device.id + " to " + a.value);
			devinfo.driver.obj.set(devinfo.device.id, a.value, a.parm);
		}
	}

	// delay if present is already handled
	g.executeAction = function(a,e) {
		var dolog = !e || (!e.nolog);
		if (dolog) g.log(g.LOG_TRACE,"action=>" + actionToText(a));
		switch (a.do) {
			case 'device':
				return self.DeviceAction(a,	true);
				break;
			case 'event':
	            //TODO: error if not exists?
				return g.runEventActions(g.eventmap[a.name]);
				break;
			case 'script':
				try {
					var s = require("./scripts/" + a.name); //  + ".js");
					return s[a.value](a.parm);
				} catch (e) {
					g.log(g.LOG_ERROR, "script error: " + e + ";" + a.name)
				}
				break;
			case 'speak':
	            if (speech) {
	                speech.say(a.value);
	            }
				g.log(g.LOG_TRACE,"speaking: " + a.value);
				break;
			case 'play':
				//player.playfile("./media/" + a.name);
				g.log(g.LOG_TRACE,"played: " + a.name);
				break;
		}
	}

	function loadPlugin(p,path) {
	    if (p.endsWith(".js")) {
	    	var d1;
	    	try {
	    		d1 = require(path + p);
	    		if (d1.driver) {
	    			d1.driver.obj = d1;
	    			g.drivermap[d1.driver.name] = d1.driver;
	    			g.log(g.LOG_TRACE,"got driver: " + d1.driver.name);
	                // check for a driver init param
	                var namepart = d1.driver.name; // p.substring(0,p.length-3); // cut off .js
	                if (g[namepart + "init"] && d1.initialize) {
	                	initdrivers.push(d1);
	                }
	                return d1;
	    		}
	    	}
	    	catch (ex) {
	    		g.log(g.LOG_TRACE,"exception " + ex);
	    	}
	    }
	 	return null;
	}

	this.setDriverDevice = function(drivername, id, val) {
		var dev = _.find(g.devicemap, function(value, key, list) {
			return ((value.driver == drivername) && (value.id == id));
		});

		if (dev) {
			self.DeviceAction({do: 'device', name: dev.name, value: val}, false);
		}
	}

	this.Init = function() {
		//
		// load drivers and build "drivers" table
		//
		g.log(g.LOG_TRACE,"loading drivers:");
		var fs = require("fs");
		var pluginfiles = fs.readdirSync("plugins");
		var initdrivers = [];
		for (var i in pluginfiles) {
		    var p = pluginfiles[i];
		    var d1 = loadPlugin(p, "./plugins/");
		}

		g.variableDriver = loadPlugin("variables.js","./");



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

		g.log(g.LOG_TRACE,"loading devices");
		db.loadDevices().then(function(err,devices) {
			for (var i = 0; i < devices.length; i++) {
				var data = devices[i];
				// save the ids of the devices
				g.devicemap[data.name] = data;
				g.deviceIdmap[data._id] = data;
			}
		});

		g.log(g.LOG_TRACE,"loading events");
		//TODO: add event fields for disabled/logged
		// read events, do all subscribes
		//eventmap[e.name] = {name,trigger,value, actions[]}
		// action = { do, name, value, parm, delay, text}
		db.loadEvents().then(function(err,events) {
			for (var i = 0; i < events.length; i++) {
				var e = events[i];
			    checkEventActions(e);
			    for (var ai in e.actions) {
			        e.actions[ai].text = actionToText(e.actions[ai]);
			    }
			    g.eventmap[e.name] = e;
			    var devname = e.trigger;
			    if (devname && devname != "none") {
			        var devinfo = getDeviceInfo(devname);
			        if (!devinfo.driver) {
			            g.log(g.LOG_TRACE,"Error on event " + e.name + ". No device " + devname + ".");
			        }
			        else {
			            devinfo.driver.obj.subscribe(devinfo.device.id,e.value, (function(e) {
				            return function() {
				                g.runEventActions(e);
				            }
			        	})(e));
			        }
			    }
			}
		});
	}
}

module.exports = new evactions();