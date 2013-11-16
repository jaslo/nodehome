
var http = require("http"),
url = require("url");


function homeseerpost() {
    var self = this;
    var homeseer_url = "http://192.168.0.99:82";
    var parsed = url.parse(homeseer_url);

    // val is "get", params is url
    this.Post = function(params) {
        // for a post, the url with be split from the data by a space
        // val is the parameter
        var data = 'scriptcmd=hs.' + params + '&runscript=Execute+Command&ref_page=ctrl';
        var headers = {};
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        headers["Content-Length"] = data.length;
        try {
	        var req = http.request({
	            hostname: parsed.hostname,
	            method: "POST",
	            headers: headers,
	            path: parsed.path,
	            port: parsed.port
	        });
	        req.on('error', function(e) {
			  console.log('problem with request: ' + e.message);
			});
	        req.write(data + "\n");
	        req.end();
	    }
	    catch(e) {

	    }
    }

}

module.exports = new homeseerpost();

