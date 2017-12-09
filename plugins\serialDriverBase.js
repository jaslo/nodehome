
var driverBase = require("./driverBase");
var util = require("util");
var g = require("../globals");
var ser2netproxy = require("../ser2netproxy.js");
var serialport = require("serialport").SerialPort;


function serialDriverBase() {
    var self = this;
    var nodeser;

    driverBase.call(this);

    this.setDevice = function(basedev, baseparm, cb) {
    	nodeser = null;
        if ((basedev[0] == '/') || basedev.startsWith("COM")) {
            nodeser = new serialport(basedev, baseparm, false);
        }
        else if (basedev[0].match(/^[0-9]/)) {
            var ncolon = basedev.indexOf(':');
            if (ncolon == -1) {
            	console.log("try ser2net");
            	nodeser = new ser2netproxy({host: basedev.substring(0,ncolon), port:basedev.substring(ncolon+1)});
            }
        }
        if (!nodeser) {
            console.log("failure to initialize device " + self.driver.name);
            nodeser = {
            	'write': function(data) { return }
            };
            return null;
        }

        nodeser.open(function() {
            nodeser.on('data', function(data) {
                // wait until last byte is '#' ?
                self.onData(data);
            });
            // opened, can now start reading and writing
            if (cb)
                cb();
        });
    };

    this.sendser = function(data) {
        if (nodeser)
        	nodeser.write(data);
    };
}

util.inherits(serialDriverBase, driverBase);

module.exports = serialDriverBase;
