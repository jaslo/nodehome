
var driverBase = require("./driverBase");
var http = require("http"),
util = require("util"),
url = require("url");


function homeseerpost() {
    var self = this;
    var homeseer_url = "http://192.168.0.99:82";
    var parsed = url.parse(homeseer_url);

    driverBase.call(this);

    // val is "get", params is url
    this.set = function(id, val, params) {
        // for a post, the url with be split from the data by a space
        // val is the parameter
        var data = 'scriptcmd=hs.' + val + '&runscript=Execute+Command&ref_page=ctrl';
        var headers = {};
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        headers["Content-Length"] = data.length;
        var req = http.request({
            hostname: parsed.hostname,
            method: "POST",
            headers: headers,
            path: parsed.path,
            port: parsed.port
        });
        req.write(data + "\n");
        req.end();
    }

    this.driver = {
        name: 'homeseerpost',
        cmds:['set'],
    }
}

util.inherits(homeseerpost, driverBase);
module.exports = new homeseerpost();

