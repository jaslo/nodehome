
var a = require("./testx");


function test2() {
	this.start = function() {
		a.hello("from 2");		
	}
}

module.exports = new test2();