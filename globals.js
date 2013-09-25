var path = require("path"),
    argv = require("optimist").argv,
    cluster = require("cluster"),
    Deferred = require("JQDeferred"),
    dateFormat = require("dateformat");

dateFormat.masks.logTime = 'HH:MM:ss.l';
var g = {
    MongoHost: "localhost",
    htmlBase: path.join(__dirname,"/html"),

    LOG_VERBOSE: 10,
    LOG_DIAGNOSTIC: 9,
    LOG_DEBUG: 8,
    LOG_TRACE: 7,

    LOG_WARNING: 5,
    LOG_IMPORTANT: 4,

    LOG_ERROR: 2,
    LOG_URGENT: 1,
    LOG_CRITICAL: 0,

    maxLogLevel: 9,

    log: function(level, message) {
        if (level <= g.maxLogLevel) {
        	var line = dateFormat(new Date(),"logTime") + " " + message
            console.log(line);
            //fs.append("/var/logs/nodehouse.log",line + "\n");
        }
    },

    waitFor: function(millis) {
        var dfr = new Deferred();
        var theTimer = setTimeout(function() {
            clearTimeout(theTimer);
            dfr.resolve();
        }, millis);
        return dfr.promise();
    },

    parsex10id: function(id) {
    	var house = id.substr(0,1);
    	var num = parseInt(id.substr(1));
    	return {'house': house, 'num': num };

    }
};

g.drivermap = {};
g.devicemap = {};
g.eventmap = {};
g.delayedactions = {};

if (!String.prototype.hasOwnProperty("endsWith")) {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (!String.prototype.hasOwnProperty("startsWith")) {
    String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix) === 0;
    };
}


module.exports = g;

