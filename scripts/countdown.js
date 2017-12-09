var Deferred = require("JQDeferred"),
	scriptlib = require("../scriptlib");

function countdown() {

    function count(n,d) {
        if (scriptlib.deviceState("keypad") == "on") {
            d.resolve(0);
            return;
        }
        if (n == 0) {
            d.resolve(1);
            return;
        }
        if (n % 10 == 0 || n < 10) {
        	scriptlib.say(n);
        }
        setTimeout(function() {
            count(n-1,d);
        },1000);
    }

    this.countdown = function(maxSeconds) {
        var d = new Deferred();
        count(maxSeconds, d);
        return d.promise();
    }
}

module.exports = new countdown();