var db = require("./dbdata1.js"),
    Q = require("q"),
    g = require("./globals.js");


db.init();
db.loadDevices()
.then(function(devices) {
	for (var i = 0; i < devices.length; i++) {
		var data = devices[i];
// save the ids of the devices
		g.devicemap[data.name] = data;
		g.deviceIdmap[data._id] = data;
		console.log("process device: " + data.name);
	}
    //return Q(true);
})
.then(function() {
    db.loadEvents()
    .then(function(events) {
    	for (var i = 0; i < events.length; i++) {
    		var e = events[i];
    		console.log("process event: " + e);
    	}
    });
});

