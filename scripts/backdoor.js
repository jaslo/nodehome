function backdoor() {

this.run = function(devid) {

    // motion while armed


    /*
    vthis = devid;
    vlast = variable("devlast");

    vnext = vthis;

    if (["A14","A6","A3"].indexOf(vthis) != -1) {
        gotAlarm = true;
    }

    if (vthis == "B2") {
        g.log("---- backdoor: vthis = b2 vlast = " + vlast);
    }
    else if (vthis != "A14" || vlast != "A14") {
        g.log("---- motion: vthis = " + vthis + " vlast = " + vlast);
    }
    if (gotAlarm && variable("devalarm") == "armed") {
        g.log("---- motion while armed sensor " + vthis + "=" + devicestatus(vthis));
        variableset("devalarm", "counting");
        g.log("ALARM: -----Tripped -----");

        scriptrun("countdown","countdown").then(function(nret) {
            variableset("devlast","");
            variableset("devalarm","off");
            x10set("H16",2);
            if (nret) return;
            g.log("ALARM: reset");
            runevent("InDoor");
            vnext = "";
        });
    }
    else if (vlast == vthis) {

    }
    else {
        nmin = deviceLatest(vlast);
        if (nmin < 2) { // 2 minutes
            if (vthis == "A14") {
                if (vlast == "B2") {
                    g.log("---- In door ----");
                    runevent("Indoor");
                    vnext = "";
                }
            }
            else if (vthis == "B2") {
                if (vlast == "A14") {
                    g.log("---- Out door ---");
                    vnext = "";
                }
            }
            else if (!gotAlarm) {
                g.log("??? unexpected");
            }
        }
        else {

        }
    }

    */
}

}

module.exports = new backdoor();
