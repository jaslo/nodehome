var Deferred = require("JQDeferred"),
	scriptlib = require("../scriptlib");

function backdoor() {

this.run = function(devid) {

    // motion while armed
    var gotAlarm = false;

    var vthis = devid;
    var vlast = scriptlib.variable("devlast");
    scriptlib.variableSet("devlast", vthis);
    var vnext = vthis;

    var backdoor = "Back door";
    var kitchenmotion = "kitchen motion";

    if (["kitchen motion","downstairs motion","stairwell motion"].indexOf(vthis) != -1) {
        gotAlarm = true;
    }

    if (vthis == backdoor) {
        scriptlib.log("---- backdoor: vthis = b2 vlast = " + vlast);
    }
    else if (vthis != kitchenmotion || vlast != kitchenmotion) {
        scriptlib.log("---- motion: vthis = " + vthis + " vlast = " + vlast);
    }
    if (gotAlarm && scriptlib.variable("arm state") == "armed") {
        scriptlib.log("---- motion while armed sensor " + vthis + "=" + scriptlib.deviceState(vthis));
        scriptlib.variableSet("arm state", "counting");
        scriptlib.log("ALARM: -----Tripped -----");

        scriptlib.say("Please enter the disarm code. You have sixty seconds");
        scriptlib.scriptrun("countdown","countdown",59).then(function(nret) {
        	if (!nret) {
        		scriptlib.say("Alarm disabled. Welcome home.");
        	}
        	else {
        		scriptlib.say("Alarm triggered, security response engaged.");
        	}
            scriptlib.variableSet("devlast","");
            scriptlib.variableSet("arm state","off");
            scriptlib.variableSet("keypad", "on");
            // curl "pushover" nret ? alarm triggered : alarm reset
            if (nret) return;
            scriptlib.log("ALARM: reset");
            //runevent("InDoor");
            vnext = "";
        });
    }
//    else if (vlast == vthis) {
//
 //   }
    else {
    	var lastTime = scriptlib.deviceLatest(vlast);
    	var nmin = 100;
    	if (lastTime) {
        	nmin = (new Date().getTime() - lastTime.getTime())/60000;
        }
        if (nmin < 2) { // 2 minutes
            if (vthis == kitchenmotion) {
                if (vlast == backdoor) {
                    scriptlib.log("---- In door ----");
                    runevent("Indoor");
                    vnext = "";
                }
            }
            else if (vthis == backdoor) {
                if (vlast == kitchenmotion) {
                    scriptlib.log("---- Out door ---");
                    vnext = "";
                }
            }
            else if (!gotAlarm) {
                scriptlib.log("??? unexpected");
            }
        }
        else {

        }
    }

}

}

module.exports = new backdoor();
