var db = require("./dbdata_redis.js"),
    Q = require("q"),
    g = require("./globals.js");


function evactions() {
	var self = this;


var speech = null;
// flitespeak is nice for ubuntu, but it's loud!
//speech = require("./speech/flitespeak.js");

//speech = require("./speech/espeak.js");
// available for windows


// no cepstral except on rpi
//speech = require("./speech/cepstral.js");

	// globally accessible to app.js
	g.runEventActions = function(name) {
		db.event(name)
		.then(function(e) {
			var dolog = !e || (!e.nolog);
			if (dolog) g.log(g.LOG_TRACE,"event=>" + e.name);
		    e.latest = new Date();
		    saveEvent(e);
			// run the event actions
			for (i1 = 0; i1 < e.actionslength; i1++) {
				db.action(e,i1).then(function(a) {
					if (a.delay) {
						var ms = g.delayInMs(a.delay);
			            //TODO: track all the currently "delayed" actions
		                // persist these!!!!
		                db.delayedAction(a.name)
		                .then(function(da) {
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
				            db.saveDelayedAction(a.name,{event: name, actindex: i1, timeout: to});
				       	});
					}
					else g.executeAction(a, e);
				});
			}
		});
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
		var now = new Date();
		db.device(a.name)
		.then(function(devobj) {
	        if (typeof(devobj.id) != "string") {
	            g.log(g.LOG_ERROR, "bad device for " + a.name);
	        }
	        devobj.latest = now;
	        devobj.state = a.value;
	        db.saveDevice(devobj);

	        if (toDevice) {
	        	g.drivermap[devobj.driver].publishEvent(devobj.id, a.value);
	        	g.log(g.LOG_DIAGNOSTIC, "set " + devobj.id + " to " + a.value);
				g.drivermap[devobj.driver].obj.set(devobj.id, a.value, a.parm);
			}
		});
	}

	// delay if present is already handled
	// a is an action object
	g.executeAction = function(a,e) {
		var dolog = !e || (!e.nolog);
		if (dolog) g.log(g.LOG_TRACE,"action=>" + actionToText(a));
		switch (a.do) {
			case 'device':
				return self.DeviceAction(a,	true);
				break;
			case 'event':
	            //TODO: error if not exists?
				return g.runEventActions(a.name);
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


		// first run all the initalize, then initialize1, then initialize2, etc.

		for (var i = 0; i < 10; i++) {
			var method = "initialize" + (i > 0 ? i : "");
			for (var j in g.drivermap) {
				var d1 =  g.drivermap[j].obj;
				var p = g[d1.driver.name + method];
				var parm;
				if (p && typeof(d1[method]) == "function")  {
					if (typeof(p) == "function") {
						parm = p();
					}
					else parm = p;
					d1[method](parm);
				}
			}
		}


		// start the redis db and events and devices
		var d1 = Q.defer();

		db.init()
		.then(function() {
			db.loadDevices()
			.done(function(devs) {
			    db.loadEvents()
			    .then(function(events) {
			    	var plist = [];
					for (var i = 0; i < events.length; i++) {
						var eq = Q.defer();
						plist.push(eq);
						(function(eq) {
							db.event(events[i])
							.then(function(e) {
							    //checkEventActions(e);
								for (var j = 0; j < e.actionslength; j++) {
									db.action(e,j).then(function(a) {
							        	a.text = actionToText(a);
							        	db.saveAction(e,j);
							        });
							    }
							    return e;
							})
							.then(function(e) {
								db.device(e.trigger)
								.then(function(dev) {
									driverentry = g.drivermap[dev.driver];
									driverentry.obj.subscribe(dev.id,e.value, (function(e) {
										return function() {
											g.runEventActions(e.name);
										}
									})(e));
								})
							})
							.then(function(e) {
								eq.resolve();
							})
						}(eq)); // closure

					} //rof
					Q.all(plist).then(function () { d1.resolve(); });
				});
			});
		});
		return d1.promise;
	}
}


module.exports = new evactions();