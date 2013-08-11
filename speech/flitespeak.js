
var fl = require("flite");

function flitespeak() {

    this.say = function (message) {
        fl({voice: 'slt', ssml: false },function (err, speech) {
            speech.say(message, function (err) {
                if (err) console.error('I\'m afraid I can\'t do that, Dave', err);
            });
        });
    }
}

module.exports = new flitespeak();
