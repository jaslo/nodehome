var db = require("./dbdata_redis.js"),
    Q = require("q"),
    g = require("./globals.js");

db.init();
db.loadDevices()
.done(function(devs) {
    db.loadEvents()
    .then(function(events) {
		for (var i = 0; i < events.length; i++) {
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
							g.runEventActions(e);
						}
					})(e));
				})
			})
		}
	})
});
