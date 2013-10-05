
var scriptlib = require("../scriptlib");

var driveway = function() {
	
	this.Run = function() {
		if (scriptlib.variable("arm state") == "arming") {
			scriptlib.variableSet("arm state", "armed");
			scriptlib.variableSet("keypad","off");
		}
	}

}

module.exports = new driveway();
