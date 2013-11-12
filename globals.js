var path = require("path"),
    argv = require("optimist").argv,
    cluster = require("cluster"),
    Deferred = require("JQDeferred"),
    url = require("url"),
    http = require("http"),
    dateFormat = require("dateformat");

dateFormat.masks.logTime = 'HH:MM:ss.l';
var g = {
    MongoHost: "localhost",
    htmlBase: path.join(__dirname,"/html"),

    RemoteReceiverTimeout: 4000,

    loglist: [],
    logcount: 0,
    loglimit: 1000,

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
        	var line = dateFormat(new Date(),"logTime") + " " + message;
            console.log(line);
            //fs.append("/var/logs/nodehouse.log",line + "\n");
            g.loglist.push(dateFormat(new Date(),"isoUtcDateTime") + " " + message);
            g.logcount++
            if (g.logcount > g.loglimit) {
            	g.loglist.splice(0,1);
            }
        }
    },

    delayInMs: function(del) {
		var n = parseInt(del);
		var ms = 0;
		if (del.indexOf(':') != -1) {
	        // [hh:][mm:][ss][.ms]
	        var parts = del.split(":");
	        var total = parts[0] * 3600;
	        if (parts.length > 1) {
	        	total += parts[1] * 60;
	        }
	        if (parts.length > 2) {
	        	total += parts[2];
	        }
	        return total * 1000;
		}
		else if (del.endsWith("sec")) {
			ms = n * 1000;
		}
		else { // assume minutes
			ms = n * 60 * 1000;
		}
		return ms;
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

    },

    curl: function (method, urlstr, datastr) {
        // for a post, the url with be split from the data by a space
        var parsed = url.parse(urlstr);
        var headers = {};
        method = method.toUpperCase();
        headers["Accept"] = "*/*";
        if (method == "POST") {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            headers["Content-Length"] = datastr.length;
        }
        var req = http.request({
            hostname: parsed.hostname,
            method: method,
            headers: headers,
            path: parsed.path,
            port: parsed.port
        });
        if (method == "POST") {
            req.write(datastr);
            req.end();
        }
    }
};

g.drivermap = {};
g.devicemap = {};
g.deviceIdmap = {};
g.eventmap = {};
g.delayedactions = {};
g.subtbl = {};
g.variableDriver = null;

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

