
var g = require("../globals");

var RETRIGGER = 30 * 1000; // 30 sec then retrigger OK

function driverbase() {
    var states = {};
	var subtbl = {};

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

        if (!subtbl[idexp]) {
            subtbl[idexp] = {};
        }
        if (!subtbl[idexp][val]) {
        	subtbl[idexp][val] = [];
        }
        subtbl[idexp][val].push(cb);
	};

	this.publish = function(id, val) {
		val = val.toLowerCase();
		for (var idexp in subtbl) {
			if (!subtbl.hasOwnProperty(idexp)) continue;
			if (id.match(idexp)) {
				if (subtbl[idexp][undefined]) {
                    subtbl[idexp][undefined].forEach(function(f) { f(id,val); });
                }
				if (subtbl[idexp][val]) {
					subtbl[idexp][val].forEach(function(f) { f(id,val); });					
				}
			}
		}
	};
}

module.exports = driverbase;