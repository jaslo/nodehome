var driverBase = require("./driverBase");
var http = require("http"),
util = require("util"),
url = require("url"),
scriptlib = require("../scriptlib"),
g = require("../globals");

function keypad() {
	var self = this;
    var x10driver;
    var housecode;
    var history = 0;
    var code = "3141";

    driverBase.call(this);

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

        // all unit codes, all values
        g.drivermap[x10driver].obj.subscribe(housecode + "[1-4]", "on",function(idexp,val) {
            // on matching house data
            var thiscode = idexp.substr(1);

            scriptlib.say(thiscode);

            if (code[history] == thiscode) {
                history++;
                if (history == code.length) {
                    if (self.canTrigger("keypad","on")) {
                    	self.publish("keypad","on");
                    }
                }
            }
            else {
            	history = 0;
            	if (code[0] == thiscode) history = 1;
            }
        });
    }

    this.set = function(id, value, parm) {
        if (value == "reset") {
            history = 0;
        }
        else if (value == "set") {
            code = parm;
        }
    }

    this.driver = {
		name: 'keypad',
        cmds: ['clear'],
		events:['code']
    };
}

util.inherits(keypad, driverBase);
module.exports = new keypad();

