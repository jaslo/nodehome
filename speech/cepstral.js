var exec = require('child_process').exec;

function cepstral() {

    this.say = function (message) {
//        var spawn = require('child_process').spawn,
//        var cp = spawn('swif', ['-n', 'Callie','-m','text','"' + message + '"']);
		try {
	        exec('swift -n Callie -m text "' + message + '"', function (error, stdout, stderr) {
	            console.log('stdout: ' + stdout);
	            console.log('stderr: ' + stderr);
	            if (error !== null) {
	              console.log('exec error: ' + error);
	            }
	        });
    	}
    	catch(e) {
    		console.log("exception on exec speak: " + e);
    	}
    }
}

module.exports = new cepstral();
