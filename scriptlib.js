var evactions = require("./evactions"),
	g = require("./globals");


function scriptlib() {
	var self = this;

	// for scripts
	this.variable = function(id) {
		return g.variableDriver.get(id);
	}

	
	this.variableSet = function(id, val) {
		return self.deviceAction(id,val);
	}

	this.deviceAction = function(id, val) {
		return g.executeAction({do: 'device', name: id, value: val}, null);
		//g.variableDriver.set(id,val);
	}

	this.scriptrun = function(name,val,parm) {
		return g.executeAction({do: "script", name: name, value: val, parm: parm},null);
	}

	this.log = function(s) {
		return g.log(g.LOG_TRACE,s);
	}

	this.deviceState = function(id) {
		return g.devicemap[id].state;
	}

	this.deviceLatest = function(id) {
		return g.devicemap[id].latest;
	}

	this.say = function(s) {
		return g.executeAction({do: 'speak', value: s},null);
	}

	this.curl = function(method, url, parms) {
		return g.curl(method,url,parms);
	}

}

module.exports = new scriptlib();