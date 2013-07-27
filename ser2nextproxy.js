
var util = require("util");
var events = require("events");
var net = require("net"):


function ser2netproxy(netaddr) {
	var self = this;

	events.EventEmitter.call(this);
	var client = net.connect(netaddr, function() {
		this.setEncoding('ascii'); // read data will now return ascii strings, not buffer objects
		self.emit("open");
	}
	client.on('data', function(data) {
		self.emit('data',data);
	});

	this.write = function (data, cb) {
		client.write(data, "ascii", function() {
			cb();
		});
	}
}

util.inherits(ser2netproxy, events.events.EventEmitter);


module.exports = ser2netproxy;
