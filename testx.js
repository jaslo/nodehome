
var globinst = 0;

function f() {
	this.inst  = 1;
	this.hello = function(str) {
		console.log("instance " + this.inst + " & " + str);
	}

	this.inst = globinst++;
	console.log("f constructor");
}

var f1 = new f();

module.exports = f1;
