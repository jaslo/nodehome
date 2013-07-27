
var driverBase = require("./driverBase");
var util = require("util");

function acrf() {
    var nodeser;
    var bufferedin = "";

    driverBase.call(this);

    this.initialize = function (basedev) {
	    if (basedev[0] == '/') {
	    	nodeser = new require("serialport").SerialPort(basedev, { baudrate: 9600 });
	    }
	    else if (IsNumeric(basedev[0])) {
	    	var ncolon = basedev.indexOf(':');
	    	nodeser = new require("ser2netproxy")({host: basedev.substring(0,ncolon), port:basedef.substring(ncolon+1)});
	    }
	    /*
	    Sending an extended code message to an extended code dimmer:
	    To TI103-RS232: $>28001A[1]013F31A[1]013F312D#
	    Response: $<2800!4B#
	    */


	    nodeser.on("open", function() {
	        nodeser.on('data', function(data) {
	            bufferedin += data;   
	        });
	    });
	}
	
    var readser = function() {
        var s = bufferedin;
        bufferedin = "";
        return s;
    }

    var sendser = function(data) {
        nodeser.write(data, function(err, results) {
            console.log("serial write results: " + results);
        });
    }
	

    this.set = function(id, value, parm) {

    }


    this.driver = {
 		name: 'acrf', idtype: 'x10',
    	cmds: ['on','off', 'dim','bright'],
    	events: ['on','off']
    };
}


util.inherits(acrf, driverBase);

module.exports = new acrf();