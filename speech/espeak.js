var espeak = require("espeak");


function espeaker() {
    
    this.say = function (message) {
        // optionally add custom cli arguments for things such as pitch, speed, wordgap, etc.
        espeak.speak(message, ['-p 60', '-s 90', '-g 30'], function(err, wav) {});
    }
}

module.exports = new espeaker();

