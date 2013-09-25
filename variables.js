var driverBase = require("./plugins/driverBase.js");
var util = require("util");

function variables() {
// handle by base class
//    this.subscribe = function(name, val, cb) {
//    }
	var self = this;

	var vars = {};

 	driverBase.call(this);

    this.set = function(id, value, parm) {
    	// value is the cmd, only "set" supported now
    	console.log("set variable " + id + " to " + parm);
    	vars[id] = value;
    }

    this.get = function(id) {
    	return vars[id];
    }

    this.driver = {
 		name: 'variables', idtype: 'string',
    	cmds: ['set'],
    	events: ['set']
    };
}

util.inherits(variables, driverBase);

module.exports = new variables();
