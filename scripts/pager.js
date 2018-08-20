var scriptlib = require("../scriptlib");


function pager() {

	this.pageifttt = function(pagemsg) {
		//hs.SendEmail "trigger@ifttt.com","jasonl@happycatcreamery.com","#homeseer","At " & 
		//Time & " " & pagemsg
	}

	this.pagemail = function(pagemsg) {
		//hs.SendEmail "XsFEKbzB5qzR6waEcQXT6KeKKrFM5t@api.pushover.net",
		//"jasonl@happycatcreamery.com","#homeseer","At " & Time & " " & 'pagemsg


	//'call hs.SendEmail("14083297447@txt.voice.google.com",
	// "home@homeseer.com","home",pagemsg)
	//'call hs.SendEmail("4083679989@messaging.sprintpcs.com",
	// 	"home@homeseer.com","home",pagemsg)
	//'call hs.SendEmail("4083149649@vtext.com","alarm@homeseer.com","alarm",pagemsg)

	}


	this.pagePushover = function(pagemsg) {
		//const headers="Content-Type: application/x-www-form-urlencoded" 

		var data= 
			"token=xL3Z6bnV93bhFtEFDT5MZQPoyLrS4Z&" +"user=XsFEKbzB5qzR6waEcQXT6KeKKrFM5t&message=" + pagemsg;

		scriptlib.curl("POST","https://api.pushover.net/1/messages.json",data);

		//s = hs.URLAction("https://api.pushover.net/1/messages.json", "POST", pagemsg, headers)

	}

}

module.exports = new pager();
