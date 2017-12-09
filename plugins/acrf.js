
var util = require("util");
var g = require("../globals");
var serialbase = require("./serialDriverBase.js");

function acrf() {

    var self = this;
    var expectResults = false;
    var nodeser;
    var bufferedin = "";

    var housebits = [ 0x06, 0x0e, 0x02, 0x0a, 0x01, 0x09, 0x05, 0x0d, 0x07, 0x0f, 0x03, 0x0b, 0x00, 0x08, 0x04, 0x0c ];
    var reversehousecodes = [
        "M","N","O","H","C","D","A","B","E","F","G","H","K","L","I","J"];


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
        self.setDevice(base, baseobj);
    };

//    var states = {}; // current value by unit id

    this.onData = function(data) {
        var states = {}; // current value by unit id

        var str = data.length + " => ";
        for (var i = 0; i < data.length; i++) {
            str += data[i].toString(16);
        }
        g.log(g.LOG_VERBOSE,str);


        var house = reversehousecodes[(data[0] >> 4) & 0x0f];
        var unit = (data[0] & 4) << 1;
        unit |= (data[2] & 0x40) >> 4;
        unit |= (data[2] & 8) >> 2;
        unit |= (data[2] & 0x10) >> 4;
        unit += 1;

        var val = (data[2] & 0x20) ? "off" : "on";

        var id = house + unit;
        g.log(g.LOG_VERBOSE, "acrf data " + id + val);
        if (self.canTrigger(id,val)) {
            self.publish(id,val);
        }
    }

    // dev is "A01" or A1
    this.set = function(id, value, parm) {
        var parsed = g.parsex10id(id);
        var house = parsed.house;
        var num = parsed.num;

        num = num - 1;
        var extrabit = num & 8;
        var unitbits = (num & 3) << 3 | (num & 4) >> 2;
        if (value == 'off')
            unitbits |= 4;
        var housecode = housebits[house.charCodeAt(0) - 'A'] | extrabit;
    };

    this.driver = {
        name: 'acrf', idtype: 'x10',
        cmds: ['on','off', 'dim','bright'],
        events: ['on','off']
    };
}

util.inherits(acrf, serialbase);

module.exports = new acrf();