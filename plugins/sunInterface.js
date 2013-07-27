var http = require("http");

function SunInterface() {
	// get locale and sunrise/sunset times

	// hourangle = acos((sin(-.83degrees) - sin(phi) x sin(delta))/(cos(phi) * cos(delta));
	// phi is north latitude
	// delta is

	// Jset = 2451545.0009 + ((w0 + lw)/360) + n + .0053 * sin(M) - .0069 * sin (2 * gamma)
	// w0 = hour angle, delta = declination of the sun
/*
	var dst = 1;
	var now = new Date();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var tzhours = -Math.floor(now.getTimezoneOffset() / 60);
	var latitude = 37.3041; // san jose
	var longitude = -121.8727;

	http.request({
		hostname: 'www.earthtools.org',
		path:'/sun/' + latitude + '/' + longitude + "/" + day + '/' + month + '/' + tzhours + '/0'
	}, function (res) {

		sunrise = xpath("/sun/morning/sunrise")
		sunset = xpath("/sun/evening/sunset");

		g.TimeEvents.add(sunrise,'sunrise');
		g.TimeEvents.add(sunset,'sunset');

	});

*/

    function fixDegrees(L) {
        while (L < 0) L += 360;
        L = L % 360;
        return L;
    }

    function toRad(Value) {
        /** Converts numeric degrees to radians */
        return Value * Math.PI / 180;
    }

    function toDegrees(Value) {
        return Value * 180 / Math.PI;
    }
/*
    http://williams.best.vwh.net/sunrise_sunset_algorithm.htm

    zenith:                Sun's zenith for sunrise/sunset
      offical      = 90 degrees 50'
      civil        = 96 degrees
      nautical     = 102 degrees
      astronomical = 108 degrees
*/
    var zenith = toRad(90.8333);
    var localOffset = new Date().getTimezoneOffset(); // in minutes

    function calc(month, year, day, longitude, latitude, rise) {
// 1. first calculate the day of the year
        var N1 = Math.floor(275 * month / 9);
        var N2 = Math.floor((month + 9) / 12);
        var N3 = (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3));
        var N = N1 - (N2 * N3) + day - 30;
// 2. convert the longitude to hour value and calculate an approximate time
        var lngHour = longitude / 15;
        var t;
        if (rise) {
            t = N + ((6 - lngHour) / 24);
        } else { // set
            t = N + ((18 - lngHour) / 24);
        }
// 3. calculate the Sun's mean anomaly
        var M = (0.9856 * t) - 3.289;
//4. calculate the Sun's true longitude
        var L = M + (1.916 * Math.sin(toRad(M))) + (0.020 * Math.sin(toRad(2 * M))) + 282.634;
        L = fixDegrees(L);
//  NOTE: L potentially needs to be adjusted into the range [0,360) by adding/subtracting 360

//5a. calculate the Sun's right ascension

        var RA = toDegrees(Math.atan(0.91764 * Math.tan(toRad(L))));
        RA = fixDegrees(RA);
//    NOTE: RA potentially needs to be adjusted into the range [0,360) by adding/subtracting 360

//5b. right ascension value needs to be in the same quadrant as L

        var Lquadrant  = (Math.floor( L/90)) * 90;
        var RAquadrant = (Math.floor(RA/90)) * 90;
        var RA = RA + (Lquadrant - RAquadrant);

//5c. right ascension value needs to be converted into hours

        RA = RA / 15;

//6. calculate the Sun's declination

        var sinDec = 0.39782 * Math.sin(toRad(L));
        var cosDec = Math.cos(Math.asin(sinDec));

//7a. calculate the Sun's local hour angle
        var cosH = (Math.cos(zenith) - (sinDec * Math.sin(toRad(latitude)))) / (cosDec * Math.cos(toRad(latitude)));

        if (cosH >  1)
          return null;
        if (cosH < -1)
          return null;

//7b. finish calculating H and convert into hours
        var H;
        if (rise) {
          H = 360 - toDegrees(Math.acos(cosH));
        }
        else {
          H = toDegrees(Math.acos(cosH));
        }

        H = H / 15;

//8. calculate local mean time of rising/setting

        var T = H + RA - (0.06571 * t) - 6.622;

//9. adjust back to UTC

        var UT = T - lngHour;
        while (UT < 0) UT += 24;
        UT = UT % 24;

//    NOTE: UT potentially needs to be adjusted into the range [0,24) by adding/subtracting 24

//10. convert UT value to local time zone of latitude/longitude
    // localOffset is in minutes

        // the time is in hours/fractions of hours 1.5 = 1:30
        var localT = UT - (localOffset/60);

        var hh = Math.floor(localT);
        var m = (localT - hh) * 60 + 0.5;
        var suntime = new Date(year,month-1,day,hh,Math.floor(m),0,0);
        return suntime;
    }

    var citygeo = {};

    var onedaytime = 24 * 3600 * 1000;

    var latitude;
    var longit;

    function getCities() {
        return citygeo;
    }

    function setLocation(lat,longit) {
        latitude = lat;
        longitude = longit;
        gettimes();
    }


    function calc1(d,rise) {
        var mm = d.getMonth();
        var yy = d.getYear() + 1900;
        var dd = d.getDate();
        return calc(mm+1, yy,dd,latitude,longitude,rise);
    }


    var risers = [];
    var setters = [];

    var risedate;
    var setdate;
    var trise;
    var tset;

    function waitForRise() {
        setTimeout(function () {
        	for (r in risers) {
        		risers[r]();
        	}
        	risedate = new Date(risedate.getTime() + onedaytime);
        	trise = calc1(risedate,true);
        	waitForRise();
       	},trise - new Date());
    }

    function waitForSet() {
        setTimeout(function() {
        	for (s in setters) {
        		setters[s]();
        	}

        	setdate = new Date(setdate.getTime() + onedaytime);
        	tset = calc1(setdate,false);
        	waitForSet();
        },tset - new Date());
    }

    function gettimes() {
//        var t1 = calc(6, 1990,25,-74.3,40.9,true);
        risedate = new Date();
        var trise = calc1(risedate,true);
        if (risedate > trise) {
        	risedate = new Date(risedate.getTime() + onedaytime);
        	trise = calc1(risedate,true);
        }

        setdate = new Date();
        var tset = calc1(setdate,false);
        if (setdate > tset) {
        	setdate = new Date(setdate.getTime() + onedaytime);
        	tset = calc1(setdate,false);
        }

        waitForRise();
        waitForSet();
// and recalc times
    }


	this.subscribe = function(name, val, cb) {
        if (val == 'rise') {
            risers.push(cb);
        }
        else if (val == 'set') {
            setters.push(cb);
        }
        else return false;

        return true;
	}

    this.driver = {
 		name: 'sun',
    	events: ['rise','set']
    };

    var carray = rawcities;
    for (var i = 0; i < rawcities.length; i += 6) {
        var lat = rawcities[i+1] + parseInt(rawcities[i+2])/60; // 13 N
        var longit = rawcities[i+3] + parseInt(rawcities[i+4])/60; // 120 W
        if (rawcities[i+2].endsWith('S')) lat = -lat;
        if (rawcities[i+4].endsWith('W')) longit = -longit;
        citygeo[rawcities[i]] = {'lat': lat, 'long': longit };
    }
    // start it up
    gettimes();
}

module.exports = new SunInterface();
