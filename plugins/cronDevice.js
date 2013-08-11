
// cron ids are
// min hour day month dayofweek (0-6 Sun-Sat)
//  3/15 means 3rd minute and every 15
//  1-5 every weekday
//  1,3,5 MWF
//  0 8 * * 1,3,5 (mwf at 8am)
//  * * * * #2 5  is second friday of every month
// * * * * L 1 is last monday of every month

// this does not need the base class, since it handles its own subscribe
// should probably add it anyway and let subscribe override
var cronjob = require("cron").CronJob;

function cronDevice() {
	this.subscribe = function(name, val, cb) {
		new cronjob(val,cb,null,true);
	}

    this.driver = {
 		name: 'cron', 
 		idtype: 'none',
    	events: ['on']
    };
}

var theCron = new cronDevice();
module.exports = theCron;
