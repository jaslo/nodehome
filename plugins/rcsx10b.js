var driverBase = require("./driverBase");
var http = require("http"),
util = require("util"),
url = require("url"),
g = require("../globals");

function rcsx10b() {

    driverBase.call(this);

    this.initialize = function (initparm) {
        var splits = initparm.split(",");
        var x10driver =  splits[0];
        var housecode = splits[1];
        // turn on autosend mode
        sendthermo(4,27);
        // auto fan
        sendthermo(4,6);

        // all unit codes, all values
        g.drivermap[x10driver].subscribe(housecode + ".*", null,function(idexp,val) {
            // on matching thermostat data val will be a PR0 code
            // preset dim
            
        });
    }

    function getTempUnit(temp) {
    	var unit; //1-16
     	var preset; //1-32
        if ((temp > 90) || (temp < 40))
            return null;
        if (temp >= 100) {
            unit = 16;
            preset = temp - 100; // (1-32)
        }
        else if (temp >= 68) {
			unit = 15;
        	preset = temp - 68;
        }
        else if (temp >= 36) {
            unit = 14;
            preset = temp - 36;
        }
		else return null;

        return {'unit': unit, 'preset' : preset};
    }

    function getTemp(unit, preset) {
    	var base;
    	switch (unit) {
    		case 14: base = 36; break;
    		case 15: base = 68; break;
    		case 16: base = 100; break;
    		default: return 0;
    	}
    	return base + preset - 1 ;
    }

    function sendthermo() {}
    function sendttemp() {}

    this.set = function(id, val, params) {
    	if (val == 'heatmode') {
            sendthermo(4,2);
        }
        else if (val == 'coolmode') {
            sendthermo(4,3);
        }
        else if (val == 'automode') {
            sendthermo(4,4);
        }
        else {
            unitpreset = getTempUnit(params);
            if (!unitpreset) return null;

	       	if (val == 'coolpoint') {
                // unit code, level
		    	sendthermo(7,13);
                sendttemp(unitpreset)
            }

            else if (val == 'heatpoint') {
                sendthermo(7,12)
              	sendttemp(unitpreset)
            }
        }
    }

	this.driver = {
		name: 'rcsx10b',
		idtype: 'thermostat',
		values:['heatpoint', 'coolpoint', 'heatmode', 'coolmode','automode'],

		events:['temp']
    };
}

util.inherits(rcsx10b, driverBase);
module.exports = new rcsx10b();

