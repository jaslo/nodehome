var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');

function wavplayer() {
	
	this.playfile = function(f) {
		var file = fs.createReadStream('f');
		var reader = new wav.Reader();

		// the "format" event gets emitted at the end of the WAVE header
		reader.on('format', function (format) {

		  // the WAVE header is stripped from the output of the reader
		  reader.pipe(new Speaker(format));
		});

		// pipe the WAVE file to the Reader instance
		file.pipe(reader);
	
	}
}

module.exports = new wavplayer();

