
var driverBase = require("./driverBase");
var http = require("http"),
util = require("util"),
url = require("url");

function curl() {
    var self = this;

    driverBase.call(this);

    // val is "get", params is url
    this.set = function(id, val, params) {
        // for a post, the url with be split from the data by a space
        var urlstr, datastr;
        if (typeof(params) == "string") {
	        var space = params.indexOf(' ');
	        if (space > 0) {
	            urlstr = params.substring(0,space);
	            datastr = params.substring(space+1);
	        }
	        else urlstr = params;
	    } else {
	    	urlstr = params.url;
	    	datastr = params.data;
	    }
        var parsed = url.parse(urlstr);
        var headers = {};
        headers["Accept"] = "*/*";
        if (val == "POST") {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            headers["Content-Length"] = datastr.length;
        }
        var req = http.request({
            hostname: parsed.hostname,
            method: val,
            headers: headers,
            path: parsed.path,
            port: parsed.port
        });
        if (val == "POST") {
            req.write(datastr);
            req.end();
        }

    }

    this.driver = {
        name: 'curl',
        cmds:['GET','POST'],
    }   
}

util.inherits(curl, driverBase);
module.exports = new curl();

