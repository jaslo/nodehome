//var driverBase = require("./driverBase");
var util = require("util");
var g = require("../globals");
//var ser2netproxy = require("../ser2netproxy.js");
var serialbase = require("./serialDriverBase.js");

function ti103() {

    var self = this;
	var expectResults = false;
    var nodeser;
    var cmdlist = ["ON", "OFF", "DIM", "BGT", "ALN", "AUF", "ALF", "HRQ", "HAK", "PR0", "PR1", "SON", "SOF", "SRQ"];
    var bufferedin = "";
    var lastcheck;

    serialbase.call(this);

    this.initialize = function (initparm) {
        var base = initparm;
        var baseobj = null;
        var comma = initparm.indexOf(",");
        if (comma != -1) {
            base = initparm.substring(0,comma);
            try {
                baseobj = JSON.parse(initparm.substring(comma+1));
            }
            catch(e) {
                g.log(g.LOG_TRACE,"failure parsing initialize param:" + initparm.substring(comma+1));
            }
        }
        self.setDevice(base, baseobj, function() {
            checkStatusLoop();
        });
    };

    function isDigit(a) {
        return (a >= '0') && (a <= '9');
    }

    var inbuffer = "";

    var curhouse = '';
    var curunit = '';
//    var states = {}; // current value by unit id

    function decodeStr(str) {
        g.log(g.LOG_DIAGNOSTIC,str);
        var skipcheck = str.length - 3,
            val,
            house1,
            level,
            id;
        for (j = 1; j < skipcheck; ) {
            // first get unit codes
            while (j < skipcheck) {
                while (str[j] == ' ') {
                    j++;
                }
                house1 = str[j++];
                if (isDigit(str[j])) {
                    curunit = str.substring(j,j+2);
                    j += 2;
                    curhouse = house1;
                }
                else {
                    break;
                }
            }
            if (j < skipcheck) {
                // all cmds are 3 chars except 'ON'
                if (str.substring(j,j+2) == "PR") {
                    var pset = str.substring(j+2,j+3);
                    level = house1;
                    j += 3;
                    val = "PR" + pset + "-" + level;
                }
                else {
                    curhouse = house1;
                    if (str.substring(j,j+2) == 'ON') {
                        val = 'ON';
                        j += 2;
                    } else {
                        val = str.substring(j,j+3);
                        curhouse = house1;
                        j += 3;
                    }
                }
                curunit = parseInt(curunit,10);
                id = curhouse + curunit;
                if (curunit != '') {
                    if (self.canTrigger(id,val)) {
                        self.publish(id,val);
                    }
                }
            }
        }
    }

    this.onData = function(data) {
        inbuffer += data;
        if (inbuffer[inbuffer.length-1] == '#') {
            var strs = inbuffer.split("$");
            for (var sx = 0; sx < strs.length; sx++) {
	    	  var str = strs[sx];

                // after the ack or nack
                // do a query doquery() for the "echo back"

    	    	// strip the header and checksum
    	    	str = str.substring(5);
    	    	if (str.startsWith("!S0")) {
                    g.log(g.LOG_ERROR,"ti103 buffer full");
                    continue; // buffer full
                }
    	    	if (str[0] == "?") {
                    g.log(g.LOG_ERROR,"ti103 packet rejected");
                    continue;
                }
    	    	if (str[0] == '!') { // or 1 ? parse a data acknowledgement
    	    /*
    	    Response: $<2800! P01P01 PONPON P02P02 PBGTPBGTPBGTPBGTPBGTPBGTPBGT
    	    P03P03 POFFPOFF P04P04 PDIMPDIMPDIMstatesPDIMPDIMPDIM46#
    	    */
            // parse and publish
            //  K06K06 FPR0FPR0 K15K15 DPR0DPR0EB#
            //  house K
            // unit 6, pr0-F (level 9) report status temp change
            // unit 15, pr0-D (level 5) 72 degrees
                    if (str.length > 4) {
                        if (str[str.length-1] != "#") str += "#"
                        decodeStr(str);
        	    	}
                }
            }
            inbuffer = "";
	    }
        setTimeout(checkStatusLoop,2000)
    };

    // $>28001A03A03 AONAON81#
    // $>28001A03A03AONAON61#
    // call doquery on a timer?
    // keep sending 'query' until $<2800!4B# is returned?

    var checkStatusLoop = function() {
    	self.sendser("$>2800008C#");
        //setTimeout(checkStatusLoop,5000);
    };

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


! K06K06 FPR0FPR0 K15K15 PPR0E1#
23:30:54.851 set x10 K6 to PR0-F
23:30:54.852 got thermostat message
23:30:54.853 reporting setpoint
23:30:54.853 set x10 K15 to PR0-P
23:30:54.853 got thermostat message
23:30:54.853 temp: 71



    */


    var addHash = function(strcmd) {
        var i,
            chks;
        var tot = 0;
    	for (i = 0; i < strcmd.length; i++) {
    		tot = tot + strcmd.charCodeAt(i);
    	}
    	chks = (tot % 256).toString(16).toUpperCase();
        // make sure this is 2 charidacters (1 byte)
        chks = ("0" + chks).slice(-2);
    	return strcmd + chks + "#";
    };


    this.get = function(name) {

    };

    this.sendcmd = function(str) {
        var cmdser = "$>28001" + str; 
        var hstr = addHash(cmdser);
        g.log(g.LOG_DIAGNOSTIC,"send: " + hstr);
        self.sendser(hstr);
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
        if (value.startsWith("PR")) {
            cmd2 = value;
        }
        else {
        	switch (value) {
        		case 'on': cmd2 = 'ON'; break;
        		case 'off': cmd2 = 'OFF'; break;
        		case 'dim': cmd2 = 'DIM'; break;
        		case 'bright': cmd2 = 'BGT'; break;
        	}
        }

        // store the current states of ids
        if (self.canTrigger(id,cmd2)) {
            if (cmd2.startsWith("PR")) {
                self.sendcmd(house+dev);
                cmd2 = cmd2.substring(4,5) + cmd2.substring(0,3);
                self.sendcmd(house+dev+ ' ' + cmd2 + cmd2);
            }
            else {
                self.sendcmd(house + dev + house + dev + ' ' + house + cmd2 + house + cmd2);
            }
        }
    };

    // event trigger "value" is action "cmd"
    this.driver = {
 		name: 'ti103', idtype: 'x10',
    	values: ['on','off', 'dim','bright'],
    };
}

util.inherits(ti103, serialbase);

var ti103obj = new ti103();

module.exports = ti103obj;