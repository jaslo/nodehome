
var evactions = require("../evactions"),
	g = require("../globals");

var RETRIGGER = 2 * 1000; // 30 sec then retrigger OK

function driverbase() {
	var self = this;
    var states = {};

    this.canTrigger = function (id,val) {
        var now = new Date().getTime();
        if (!states[id] || states[id].val != val) {
            states[id] = {'val': val, 'last': now };
            //g.log(g.LOG_TRACE,"cantrigger: set x10 " + id + " to " + val);
            return true;
        }
        var since = now - states[id].last;
        states[id].last = now;
        if (since > RETRIGGER) {
            g.log(g.LOG_TRACE,"retrigger x10 " + id + " to " + val);
            return true;
        }
        //g.log(g.LOG_VERBOSE,"x10 " + id + " already set to " + val);
        return false;
    }

	this.subscribe = function(idexp,val,cb) {
        var valtbl;
        if (!val) {
        	val = undefined;
        }
        else val = val.toLowerCase();

        if (!g.subtbl[idexp]) {
            g.subtbl[idexp] = {};
        }
        if (!g.subtbl[idexp][val]) {
        	g.subtbl[idexp][val] = [];
        }
        g.subtbl[idexp][val].push(cb);
	};

	this.publish = function(id,val) {
		val = val.toLowerCase()
		evactions.setDriverDevice(self.driver.name, id,val);
		this.notify(id,val);
	}

	this.publishEvent = function(id,val) {
		this.notify(id,val.toLowerCase());
	}

	this.notify = function(id, val) {
		for (var idexp in g.subtbl) {
			if (!g.subtbl.hasOwnProperty(idexp)) continue;
			if (id.match(idexp)) {
				if (g.subtbl[idexp][undefined]) {
                    g.subtbl[idexp][undefined].forEach(function(f) { f(id,val); });
                }
				if (g.subtbl[idexp][val]) {
					g.subtbl[idexp][val].forEach(function(f) { f(id,val); });					
				}
			}
		}
	};
}

module.exports = driverbase;