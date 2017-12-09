var http = require("http"),
    express = require("express"),
    fs = require("fs"),
    ejs = require("ejs"),
    db = require("./data"),
    RedisStore = require('connect-redis')(express),
    sun = require('./plugins/sunInterface.js'),
    scriptlib = require("./scriptlib"),
    Q = require("q"),
    g = require("./globals");

var redis = require('redis').createClient();

// start the http app server

var app = express();

// call this in the importing code so that we can trace in and debug

    app.configure(function() {
        app.use(express.static(g.htmlBase));
        app.set('view options', { layout: false});
        app.set('views', g.htmlBase);
//        app.set('view engine','html');
        app.engine('html', ejs.renderFile);
        app.engine('ejs', ejs.renderFile);

// use redis for cookie/session data
        app.use(express.cookieParser('some secret'));
        app.use(express.session({
            store: new RedisStore({host: 'localhost', port:3000, client: redis}),
            secret: 'gallifrey'
        }));
        // add a middleware to expose the session variable to the templating engine
        app.use(function(req,res,next) {
            if (req.session) {
                res.locals.session = req.session;
            }
            next();
        });

        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);

        console.log('express is configured');
    });

    app.configure('development', function() {
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function() {
      app.use(express.errorHandler());
    });


function triggertext() {
    var v = "on " + ev.trigger + (ev.value ? "is " + ev.value : "");
    return v;
}


function actiontext(act) {
    switch (act.do) {
        case 'speak':
        case 'device':
        case 'event':
        case 'play':
        default:
        return act.do + " blah blah";
    }
}


function dodefault(res) {
    res.render('default.html');
}

app.get('/', function(req, res) {
    console.log("redirect / to login1.html");
    req.session = null;
    dodefault(res);
});

//
// driver -> event list
// typename x10,timer variable
//
function refreshMain(req,res) {
    res.render('default.html');
}


// trigger is driver + value
//  cron "* * 5 * * *"
//  device "motiondetector5 on"
//  sunrise
//


// action is
// device "light7" off
// speak "oh lordy"
// device "tempvar" 1
// event "bedtimesequence"
// curl "http://pushover...."
//


//
// add a device
app.post("/device", function(req,res) {
   // device is
   // name, location, group, drivername
   // id
   db.addDevice(req.body.name, req.body.location, req.body.group, req.body.drivername,
    req.body.id).
    then(function() {
        refreshMain(req,res);
    });
});

app.get("/cmd/loglimit", function(req,res) {});

app.get("/log", function(req,res) {
	res.send(200,g.loglist);
});

//get devices
app.get("/device", function(req,res) {
    if (req.name) {
    	db.device(req.name).then(function(dev) {
    		res.send(200,dev);
    	});
    }
    else db.allDevices().then(function(devs) {
    	res.send(200, devs);
    });
});

// update a device
app.put("/device", function(req,res) {
    var name = req.name;
    if (g.devicemap[name]) {
        g.devicemap = req;
        res.send(200);
    }
    else res.send(404);
});

app.get("/location",function(req,res) {
    res.send(200, sun.location);
});

// add an event
app.post("/event", function(req,res) {
});

app.get("/cmd/device", function(req,res) {
	scriptlib.deviceAction(req.query.name, req.query.value);
	res.send(200);
});

// http://localhost:82/cmd/event?name=Lights%20out%20bedtime
app.get("/cmd/event", function (req,res) {
    g.runEventActions(req.query.name);
    res.send(200);
    // /cmd/event?name=driveway
    // /cmd/device?name=doorbell&val=on
});


//get events
//TODO: should return JSON not html
app.get("/event", function(req,res) {
    if (req.name) {
    	db.events(req.name).then(function(e) {
            res.send(200, e);
    	});
    }
    else {
    	db.allEventsActions().then(function(evs) { res.send(200, evs);});
    }
});

module.exports = app;


