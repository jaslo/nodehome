
var driverBase = require("./driverBase");
var util = require("util");
var g = require("../globals");

function acrf() {

    var expectResults = false;
    var nodeser;
    var bufferedin = "";

    var housebits[] = { 0x06, 0x0e, 0x02, 0x0a, 0x01, 0x09, 0x05, 0x0d, 0x07, 0x0f, 0x03, 0x0b, 0x00, 0x08, 0x04, 0x0c };

    driverBase.call(this);

    this.initialize = function (basedev) {
        if ((basedev[0] == '/') || basedev.startsWith("COM")) {
            nodeser = new require("serialport").SerialPort(basedev, { baudrate: 19200 });
        }
        else if (IsNumeric(basedev[0])) {
            var ncolon = basedev.indexOf(':');
            nodeser = new require("ser2netproxy")({host: basedev.substring(0,ncolon), port:basedef.substring(ncolon+1)});
        }
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

    // dev is "A01" or A1
    this.cmd = function(id, cmd, val) {
        var parsed = g.parsex10id(id);
        var house = parsed.house;
        var num = parsed.num;

        num = num - 1;
        var extrabit = num & 8;
        var unitbits = (num & 3) << 3 | (num & 4) >> 2;
        if (cmd == 'off')
            unitbits |= 4;
        var housecode = housebits[house.charCodeAt(0) - 'A'] | extrabit;



    };

    this.driver = {
        name: 'acrf', idtype: 'x10',
        cmds: ['on','off', 'dim','bright'],
        events: ['on','off']
    };
}

util.inherits(acrf, driverBase);

module.exports = new acrf();