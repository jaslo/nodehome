var driverBase = require("./driverBase");
var http = require("http"),
util = require("util"),
url = require("url"),
g = require("../globals");

function rcsx10b() {
	var self = this;
    var x10driver;
    var housecode;

    var tobincodes =
    // A     B     C      D    E     F      G    H     I     J     K    L     M      N    O     P
    // 1     2     3      4    5     6      7    8     9     10    11   12    13     14   15    16
    [ 0x06, 0x0e, 0x02, 0x0a, 0x01, 0x09, 0x05, 0x0d, 0x07, 0x0f, 0x03, 0x0b, 0x00, 0x08, 0x04, 0x0c ];

    var toBigEndCodes =
    [ 0x06, 0x07, 0x04, 0x05, 0x08, 0x09, 0x0a, 0x0b, 0x0e, 0x0f, 0x0c, 0x0d, 0x00, 0x01, 0x02, 0x03 ];

    var frombincodes =
    [ 13, 5, 3, 11, 15, 7, 1, 9, 14, 6, 4, 12, 16, 8, 2, 10];

    var toLetters =
    ["M","N","O","P","C","D","A","B","E","F","G","H","K","L","I","J"];

    var basetemps = 
    [-60, -28, 4, 36, 68, 100];
    var reporttypes = 
    ["off mode","heat mode", "cool mode", "auto mode", "fan on", "fan auto", "setback on", "setback off",
    "temp", "setpoint", "outside temp", "setpoint heat", "setpoint cool", "sb delta"];

    driverBase.call(this);

    // unit,preset
    function sendthermo(u,p) {
    //    house unit house unit (level) pr0 or pr1) x2
        var cmd;
        if (p > 16) {
            cmd = "PR1-" + toLetters[p-17];
        }
        else {
            cmd = "PR0-"+ toLetters[p-1];
        }
        g.drivermap[x10driver].obj.set(housecode + u,cmd);    
    }

    function sendttemp(t) {
        var unitpreset = getTempUnit(t);
        switch (unitpreset.unit) {
            case 13: unitpreset.unit = 1; break;
            case 14: unitpreset.unit = 2; break;
            case 15:  unitpreset.unit = 3; break;
            case 16:  unitpreset.unit = 9; break;
        }
        sendthermo(unitpreset.unit, unitpreset.preset);    
    }

    this.createId = function(id) {
        var splits = initparm.split(",");
        var x10driver =  splits[0];
        var housecode = splits[1];
        console.log("x10driver is " + x10driver);
        //..etc...
    }

    this.initialize1 = function (initparm) {
        var splits = initparm.split(",");
        x10driver =  splits[0];
        housecode = splits[1];
        console.log("x10driver is " + x10driver);
        // turn on autosend mode
        sendthermo(4,27);
        // auto fan
        sendthermo(4,6);

        // all unit codes, all values
        g.drivermap[x10driver].obj.subscribe(housecode + ".*", null,function(idexp,val) {
            // on matching thermostat data val will be a PR0 code
            // preset dim
            // break out unit/level PR0-B
            // K6 PR0-B
            g.log(g.LOG_TRACE,"got thermostat message " + idexp + ";" + val);
            var letter = val.substr(4);
            var level = toBigEndCodes[letter.charCodeAt(0)-'a'.charCodeAt(0)];
            if (val.substr(2,1) == '1') level += 16;
            // now level is 0-31
            var unit = parseInt(idexp.substr(1));
            // convert to temp
            var temp;
            if (unit >= 11) {
                temp = basetemps[unit-11] + level;
                g.log(g.LOG_TRACE,"temp: " + temp);
            }
            if (unit == 6) {
                var cmdstr = "reporting ";
                cmdstr += reporttypes[level];
                g.log(g.LOG_TRACE,cmdstr);
            }
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

        return {'unit': unit, 'preset' : preset+1};
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

   

    this.set = function(id, val, param) {
    	if (val == 'heatmode') {
            sendthermo(4,2);
        }
        else if (val == 'coolmode') {
            sendthermo(4,3);
        }
        else if (val == 'automode') {
            sendthermo(4,4);
        }
        else if (val == 'fanon') {
            sendthermo(4,5)
        }
        else if (val == 'fanauto') {
            sendthermo(4,6);
        }
        else if (val == 'coolpoint') {
            // unit code, level
	    	//sendthermo(7,13);
            sendttemp(param)
        }
        else if (val == 'heatpoint') {
            //sendthermo(7,12)
          	sendttemp(param)
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

