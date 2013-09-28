

function countdown() {

    function count(n,d) {
        if (device("keypad") == "off") {
            d.resolve(0);
            return;
        }
        if (n == 0) {
            d.resolve(1);
            return;
        }
        say(d);
        setTimeout(function() {
            count(n-1,d);
        },1000);
    }

    this.countdown = function() {
        var d = new Deferred();
        count(g.maxSeconds, d);
        return d.promise();
    }
}

module.exports = new countdown();