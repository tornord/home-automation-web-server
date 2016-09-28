var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var nexa = require('./routes/nexa');
var house = require('./house');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view options', { pretty: true });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

houses = {}
houses.tjorn = new house.House("Tjörn", 13761810, 57.944601, 11.541627, 6.25, 23.25, 7.5, 0.5);
houses.bromma = new house.House("Bromma", 87654321, 59.326835, 17.964505, 6.25, 23.25, 7.5, 0.5);

//controls = {
//    "indoor": false,
//    "outdoor": false,
//    "random": false,
//    "test": true,
//    "auto": false
//}

app.use('/', routes);
app.use('/users', users);
app.use('/nexa', nexa);

app.use('/controls', function (req, res) {
    console.log(req.body);
    var h = "tjorn";
    if (req.body.house !== undefined)
        h = req.body.house;
    var house = houses[h];
    //console.log(JSON.stringify(house));
    var val = (req.body.value == "true");
    if (req.body.button == "test") {
        house.test = val;
        if (val)
            house.auto = false;
    } else if (req.body.button == "auto") {
        house.auto = val;
        if (val)
            house.test = false;
    } else if ((req.body.button == "indoor") || (req.body.button == "outdoor") || (req.body.button == "random")) {
        house.auto = false;
        house.test = false;
        house[req.body.button] = val;
    }
    var format = "json";
    if (req.query.format !== undefined)
        format = req.query.format;
    //console.log("test = " + house.test + ", auto = " + house.auto + ", format = " + format);
    if (house.test) {
        var t = (Math.floor((new Date()).getTime() / 1000) >> 3) % 8;
        house.indoor = (t + 3) % 4 < 2;
        house.outdoor = ((t >> 1) + 3) % 4 < 2;
        house.random = (t >= 4);
    }
    else if (house.auto) {
        var d = new Date();
        var lamps = house.createLamps();
        house.indoor = lamps[0].getState(d) == 1;
        house.outdoor = lamps[1].getState(d) == 1;
        house.random = lamps[2].getState(d) == 1;
        //console.log(lamps[0].toString());
        //console.log(lamps[1].toString());
        //console.log(lamps[2].toString());
    }
    res.send(house);
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
