var driverBase = require("./driverBase");
var util = require("util");

function variables() {
// handle by base class
//    this.subscribe = function(name, val, cb) {
//    }

    this.set = function(id, value, parm) {

    }

    this.driver = {
 		name: 'variables', idtype: 'string',
    	cmds: ['set'],
    	events: ['set']
    };
}

util.inherits(variables, driverBase);

module.exports = new variables();
