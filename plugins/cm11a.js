
var util = require("util");
var g = require("../globals");
var serialbase = require("./serialDriverBase.js");

function cm11a() {

    var self = this;


    var tobincodes =
    // A     B     C      D    E     F      G    H     I     J     K    L     M      N    O     P
    // 1     2     3      4    5     6      7    8     9     10    11   12    13     14   15    16
    [ 0x06, 0x0e, 0x02, 0x0a, 0x01, 0x09, 0x05, 0x0d, 0x07, 0x0f, 0x03, 0x0b, 0x00, 0x08, 0x04, 0x0c ];

    var frombincodes =
    [ 13, 5, 3, 11, 15, 7, 1, 9, 14, 6, 4, 12, 16, 8, 2, 10];

    // on, 2, off 3, dim 4, pr1 a, pr2 b, stat on d, stat off e, stat req f
    var funcmap = {};

    funcmap["ON"] = 2;
    funcmap["OFF"] = 3;
    funcmap["DIM"] = 4;

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
                console.log("failure parsing initialize param:" + initparm.substring(comma+1));
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
    var states = {}; // current value by unit id

    this.onData = function(data) {
        inbuffer += data;
        if (inbuffer[inbuffer.length-1] == '#') {
            var str = inbuffer;
            inbuffer = "";
            setTimeout(checkStatusLoop,2000)
        }
    };


    var checkStatusLoop = function() {
        //self.sendser("$>2800008C#");
        //setTimeout(checkStatusLoop,5000);
    };


    this.get = function(name) {

    };

// handleinitialize by base class
//    this.subscribe = function(name, val, cb) {
//    }

    this.sendcmd = function(cmd, house, dat) {
        var sendaddr = '';
        sendaddr += String.fromCharCode(cmd); // address
        var addr = (tobincodes[house-'A'] << 4) | dat;
        sendaddr += String.fromCharCode(addr);
        sendser(sendaddr);
    }

    // dev is "A01" or A1
    this.set = function(id, value, parm) {
        var parsed = g.parsex10id(id);
        var house = parsed.house;
        var num = tobincodes[parsed.num-1];
        var chks = this.sendcmd(4,house,num);
        this.waitFor(String.fromCharCode(chks), function() {
            sendser(String.fromCharCode(0));
            this.waitFor(String.fromCharCode(0x55), function() {
                this.sendcmd(6,house,funcmap[value]);
            });
        })



        this.waitFor("0x55", function() {

        });

        var cmdser = "$>28001" + house + dev + house + dev + ' ' + house + cmd2 + house + cmd2;
        sendser(addHash(cmdser));
        getresults();
    };

    // event trigger "value" is action "cmd"
    this.driver = {
        name: 'cm11a', idtype: 'x10',
        values: ['on','off', 'dim','bright'],
    };
}

util.inherits(cm11a, serialbase);

var cm11aobj = new cm11a();

module.exports = cm11aobj;