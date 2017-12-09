

function rfx10() {
	


	this.cmd = function(name, val) {

	}

	this.subscribe = function (name, val, cb) {
		
	}

	this.driver = {
		name: 'rfx10', idtype: 'x10',
		uses: 'ser2netproxy',
    	cmds:['on','off','dim', 'bright'],
    	events:['on','off']
	}	
}

module.exports = new rfx10();
