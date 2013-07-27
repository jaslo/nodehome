
var driverBase = require("./driverBase");
var util = require("util");
var g = require("../globals");

function ti103() {

    var self = this;
	var expectResults = false;
    var nodeser;
    var cmdlist = ["ON", "OFF", "DIM", "BGT", "ALN", "AUF", "ALF", "HRQ", "HAK", "PR0", "PR1", "SON", "SOF", "SRQ"];
    var bufferedin = "";

    driverBase.call(this);

    this.initialize = function (basedev) {
	    if ((basedev[0] == '/') || basedev.startsWith("COM")) {
	    	nodeser = new require("serialport").SerialPort(basedev, { baudrate: 19200 });
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
                // wait until last byte is '#' ?
	            bufferedin += data;   
	            if (!expectResults) {
	            	console.log("unsolicited data: " + data);
	            }
	        });
	    });
        checkStatus();
	}
	
    var readser = function() {
        var s = bufferedin;
        bufferedin = "";
        return s;
    }

    var sendser = function(data) {
        nodeser.write(data, function(err, results) {
        	expectResults = true;
            console.log("serial write results: " + results);
        });
    }

    function isDigit(a) {
        return (a >= '0') && (a <= '9');
    }

    var getresults = function() {
    	try {
	    	var str = readser();

            // after the ack or nack
            // do a query doquery() for the "echo back"
	    	
	    	// strip the header and checksum
	    	str = str.substring(6);
	    	if (str[0] == "!") return 0; // accepted
	    	if (str.startsWith("!S0")) return -1; // buffer full
	    	if (str[0] == "?") return -2; // bad packet
	    	if (str[0] == '!') { // or 1 ? parse a data acknowledgement
	    /*
	    Response: $<2800! P01P01 PONPON P02P02 PBGTPBGTPBGTPBGTPBGTPBGTPBGT
	    P03P03 POFFPOFF P04P04 PDIMPDIMPDIMPDIMPDIMPDIM46#
	    */	
        // parse and publish
                var skipcheck = str.length - 3;
                for (j = 1; j < skipcheck; j++) {
                    var house;
                    var unit;
                    var val;
                    // first get unit codes
                    while (true) {
                        while (str[j] == ' ') j++;
                        house = str[j++];
                        if (isDigit(str[j]) {
                            unit = str.substring(j,j+2);
                            j += 2;
                        }
                        else break;
                    }
                    // all cmds are 3 chars except 'ON'
                    if (str.substring(j,j+2) == 'ON') {
                        val = 'ON';
                    } else {
                        val = substring(j,j+3);
                    }
                    var id = house + unit;
                    if (!states[id] || states[id] != val) {
                        states[id] = val;
                        self.publish(id,val);
                    }
                }

	    	}
	    }
	    finally {
	    	expectResults = false;
	    }


    }

    // $>28001A03A03 AONAON81#
    // $>28001A03A03AONAON61#
    // call doquery on a timer?
    // keep sending 'query' until $<2800!4B# is returned?

    var checkStatus = function() {
    	sendser("$>2800008C#");
    	initializegetresults();
        setTimeout(doquery,500);
    }

    /*

Preset dim 1 mappings
M 1
N 2
O 3
P 4
C 5
D 6
A 7
B 8
E 9
F 10
G 11id
H 12initialize
K 13
L 14
I 15
J 16 

    query response
    $<2800! K05 NPR0NPR0 K15K15 BPR0BPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K04K04 
    OPR0OPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K05K05 OPR0OPR0 K06K06
     OPR0OPR0 K05 OPR0OPR0 K06K06 OPR0OPR0 K03K03 BPR0BPR0 K03K03 
     BPR0BPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K03K03 
     BPR0BPR0 K05K05 NPR0NPR0 K15K15 BPR0BPR0 K05 NPR0NPR0 K15K15 BPR0BPR0 
     K04K04 DPR0DPR0 K04K04 DPR0DPR0 K04K04 DPR0DPR0 K04K04 DPR0DPR0 K04K04 
     DPR0DPR0 K04K04 DPR0DPR0 K05K05 PPR0PPR0 K06K06 DPR0DPR0 K05 PPR0PPR0 K06K06 DPR0DPR0                                                                0D


    K5 NPR0 unit 5 level 2 = request setpoint
    K15 BPR0 unit 15 level 8  = 75 degrees
    K4 OinitializePR0 unit 4 level 3 = sent cool mode
    K5 OPR0 unit 5 level 3 = request mode
    K6 OPR0 unit 6 level 3 = report cool mode

    K3 BPR0 unit 3 level 8 = sent setpoint 75
    K5 NPR0 unit 5 level 2 = request setpoint
    K15 BPR0               - 75 degrees
    K4 DPR0 unit 4 level 6 = sent fan auto
    K5 PPR0                = request fan
    K6 DPR0                = report fan auto

id
#$<2800! D06D06 DONDON D16D16 DONDON D16D16 DOFFDOFF B02B02 BOFFBOFF B02B02 BOFFBOFF D16D16 DONDON D16D16 DOFFDOFF 
D16D16 DONDON D16D16 DOFFDOFF B02B02 BOFFBOFF D11D11 DOFFDOFF 
K04K04 OPR0OPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K04K04 OPR0OPR0 K05K05 OPR0OPR0 K06K06 OPR0OPR0 K05 OPR0OPR0 K06K06 OPR0OPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K03K03 BPR0BPR0 K05K05 NPR0NPR0 K15K15 BPR0BPR0 K05 NPR0NPR0 K15K15 BPR0BPR0 D05D05 DOFFDOFF                                                                5D#
    
    request temp = K5 MPR0

    */


    var addHash = function(strcmd) {
    	for (var i = 0; i < strcmd.length; i++) {
    		tot = tot + strcmd[i].charCodeAt();
    	}
    	var chks = (tot % 256).toString(16);
        // make sure this is 2 charidacters (1 byte)
        if (chks.length < 2) chks = "0" + chks;
    	return strcmd + chks;
    }


    this.get = function(name) {

    }

// handleinitialize by base class
//    this.subscribe = function(name, val, cb) {
//    }

    // dev is "A01" or A1
    this.set = function(id, value, parm) {
    	var parsed = g.parsex10id(id);
    	var house = parsed.house;
    	var num = parsed.num;
    	var dev = ("0" + num).slice(-2);
    	var cmd2;
    	switch (value) {
    		case 'on': cmd2 = 'ON'; break;
    		case 'off': cmd2 = 'OFF'; break;
    		case 'dim': cmd2 = 'DIM'; break;
    		case 'bright': cmd2 = 'BGT'; break;
    	}

        // store the current states of ids
        states[id] = cmd2;

    	var cmdser = "$>28001" + house + dev + house + dev + ' ' + house + cmd2 + house + cmd2;
    	sendser(addHash(cmdser));
    	getresults();
    };

    // event trigger "value" is action "cmd"
    this.driver = {
 		name: 'ti103', idtype: 'x10',
    	values: ['on','off', 'dim','bright'],
    };
}

util.inherits(ti103, driverBase);

var ti103obj = new ti103();

module.exports = ti103obj;