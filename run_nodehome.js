

// load interfaces table

// listen for events on interfaces
//
// set up delayed action table

// some "special" interfaces
var app = require("./app"),
	evactions = require("./evactions"),
	argv = require('minimist')(process.argv.slice(2)),
	Q = require("q"),
	domain = require("domain"),
	g = require("./globals");


process.on('uncaughtException', function (err) {
  console.log("uncaught: " + err + err.stack);
  process.exit();
});

Q.onerror = function(e) {
    console.log("Q exception: " + e + e.stack);
    process.exit();
}

g.argv = argv;
var sun = require("./plugins/sunInterface.js");
sun.initialize("San Jose, Calif.");

var d = domain.createDomain();
d.on('error', function(e) {
	console.log("domain error: " + e + e.stack);
})

d.run(function() {
	evactions.Init()
	.then(function() {
		g.executeAction({do: 'device', name: 'keypad', value: 'on'},null);

		// for testing
		//g.executeAction({do: 'device', name: "arm state", value: "armed"}, null);
		// normally on
		//g.executeAction({do: 'device', name: 'keypad', value: 'off'},null);

		//g.executeAction({do: 'device', name: "devlast", value: "Back door"}, null);

		g.log(g.LOG_TRACE, "start server port 82");
		app.listen(82);
	}).done();
});


