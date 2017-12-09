var espeak = require("espeak"),
	g = require("../globals");


function espeaker() {
    
    this.say = function (message) {
        // optionally add custom cli arguments for things such as pitch, speed, wordgap, etc.
        espeak.speak(message, function(err, wav) {
        	g.log(g.LOG_DIAGNOSTIC,"speak error: " + err)
        });
    }
}

module.exports = new espeaker();

