
var util = require("util");
var events = require("events");
var net = require("net");


function ser2netproxy(netaddr) {
	var self = this;
    var client = null;

	events.EventEmitter.call(this);


    this.open = function(cb) {
        client = net.connect(netaddr, function() {
            this.setEncoding('ascii'); // read data will now return ascii strings, not buffer objects
        });
        client.on('data', function(data) {
            self.emit('data',data);
        });
        cb();
    };

	this.write = function (data, cb) {
		client.write(data, "ascii", function() {
			if (cb) {
                cb();
            }
		});
	};
}

util.inherits(ser2netproxy, events.EventEmitter);


module.exports = ser2netproxy;
