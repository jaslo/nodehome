
var g = require("./globals");
var os = require("os");
var fs = require('fs');
var Q = require("q");

function db() {
var self = this;

function makeSave() {
	var obj = {};
	obj.devices = self.devices;
	obj.events = self.events;
	return JSON.stringify(obj,null,4);
}

this.saveall = function() {
	var str = makeSave();
	return Q.nfcall(fs.writeFile,"devices_events.json",str,{"encoding":"ascii"});
}

this.savesync = function() {
	var str = makeSave();
	fs.writeFileSync("devices_events.json",str, {"encoding":"ascii"});
}

// loadDevices gets called first
this.loadDevicesEvents = function() {
	return Q.nfcall(fs.readFile, "devices_events.json","ascii").
	then(function (data) {
		var obj = null;
		try {
			obj = JSON.parse(data);
			self.devices = obj.devices;
			self.events = obj.events;
			for (var i in self.devices) {
				var d = self.devices[i];
			        d.state = "none";
		        	if (!d.id) d.id = d.name;
			}
		}
		catch(e) {
			console.log('exception loading data: ' + e);
			process.exit(1);
		}
		process.on('exit', function(code) {
			self.savesync();
		  	console.log('About to exit with code:', code);
		});
	/*
		process.on('SIGINT', function() {
		  console.log('Got SIGINT.  Press Control-D to exit.');
		  process.exit(0);
		});
	*/
		return self;
	});
};


g.ti103initialize = function() {
	return "192.168.0.143:2001";
};
// 9600
//    ti103init: '/dev/ttyUSB0,{ "baudrate": 9600 }',
//    acrf2init: "/dev/nul",
g.acrfinitialize = function() {
	if (os.type().toLowerCase() == 'linux') {
		console.log("acrfdev = " + g.argv.acrfdev);
		return g.argv.acrfdev + ',{"baudRate":4800}';
	}
	else {
		return 'COM7,{ "baudRate": 4800 }';
	}
}


// these are numbered to run after the "base interface" initialization above

g.rcsx10binitialize1 = "ti103,K";
g.keypadinitialize1 = "ti103,H";

}

module.exports = new db();
