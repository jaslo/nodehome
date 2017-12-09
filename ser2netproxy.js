
var util = require("util");
var events = require("events");
var net = require("net");
var g = require("./globals");


function ser2netproxy(netaddr) {
	var self = this;
    var client = null;

	events.EventEmitter.call(this);


    this.open = function(cb) {
        try {
            client = net.connect(netaddr, function() {
                this.setEncoding('ascii'); // read data will now return ascii strings, not buffer objects
            });
            client.on('data', function(data) {
                self.emit('data',data);
            });
            client.on('error', function(e) {
	        	g.log(g.LOG_ERROR,"ser2net got client error: " + e);
                client = null;
            });
            client.on('close', function() {
	        	g.log(g.LOG_ERROR,"ser2net got close");
	        	if (client) {
	        		client.removeAllListeners();
	        	}
                client = null;
	        	self.open(cb);
            });
        }
        catch(e) {
        	g.log(g.LOG_ERROR,"exception in ser2net proxy: " + e);
            client = null;
        }
        cb();
    };

	this.write = function (data, cb) {
        if (!client) {
        	g.log(g.LOG_ERROR,"ser2net null client write");
            if (cb) {
            	cb();
            }
            return;
        }
		client.write(data, "ascii", function() {
			if (cb) {
                cb();
            }
		});
	};
}

util.inherits(ser2netproxy, events.EventEmitter);


module.exports = ser2netproxy;
