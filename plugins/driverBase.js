
function driverbase() {

	var subtbl = {};


	this.subscribe = function(id,val,cb) {
        var valtbl;
        if (!subtbl[id]) {
            subtbl[id] = {};
            subtbl[id][val] = [];
        }
        subtbl[id][val].push(cb);
	};

	this.publish = function(id,val) {
        if (!subtbl[id]) {
            return;
        }
		var cb1 = subtbl[id][val];
		if (cb1) {
            cb1.forEach( function(e) { e(); });
        }
        var cb = subtbl[id][undefined];
        if (cb) {
            cb.forEach( function(e) { e(); });
        }
	};
}

module.exports = driverbase;