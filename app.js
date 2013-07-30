var http = require("http"),
    express = require("express"),
    fs = require("fs"),
    ejs = require("ejs"),
    db = require("./data"),
    RedisStore = require('connect-redis')(express),
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
    res.render('default.ejs',{ 'PageData' : { 'eventTable': eventmap} });
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

//get devices
app.get("/device", function(req,res) {
});

// add an event
app.post("/event", function(req,res) {
});

app.get("/cmd/event"), function (req,res) {
    var e = eventmap[req.parm.name];
    runEventActions(e);
    // /cmd/event?name=driveway
    // /cmd/device?name=doorbell&val=on
}


//get events
//TODO: should return JSON not html
app.get("/event", function(req,res) {


res.send(200, eventmap);


/*res.send(200,'<table border="1">' +
            '<tr><td>run</td><td>edit</td><td>trigger</td><td>Actions</td></tr>' +
            '<tr>' +
            '    <td><input type="button" name="run" value="run"/></td>' +
            '    <td><a href="#">eventname</a></td>' +
            '    <td><a href="#">on X10 received A12 after 30 minutes</a></td>' +
            '    <td>' +
            '        <table><tr><td><a href="#">Actions</a></td></tr>' +
            '            <tr><td>trigger device front lights</td></tr>' +
            '            <tr></td>run event "bedtime dingding"</td></tr>' +
            '        </table>' +
            '    </td>' +
            '</tr>' +
        '</table>');
*/        
});



module.exports = app;


