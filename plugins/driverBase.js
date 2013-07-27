
function driverbase() {

	var subtbl = {};


	this.subscribe = function(id,val,cb) {
		if (!val) val = "--";
		subtbl[id+val] = cb;
	}	

	this.publish = function(id,val) {
		if (!val) val = "--";
		var cb = subtbl[id+val];
		if (cb) cb();
	}
}

module.exports = driverbase;