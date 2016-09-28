var express = require('express');
var router = express.Router();

require('daycount');
var SunCalc = require('./suncalc.js');
var lampmod = require('./lamp.js');

function nexaTest(house) {
    var d = new Date();
    var now = d.toUnixTime();
    var msg = [];
    msg.push([now.toFixed(0)]);
    var addRow = (t, g, u, c) => msg.push([t, g, u, c ? 1 : 0].map(d=>d.toFixed()));
    for (var i = 0; i < 9; i++) {
        var t = (now >> 3) + i + 1;
        //console.log(i + " - " + t);
        if ((t % 2) == 1)
            addRow(8 * t, house.code, 0, (t % 4) == 1);
        if ((t % 4) == 2)
            addRow(8 * t, house.code, 1, (t % 8) == 2);
        if ((t % 4) == 0)
            addRow(8 * t, house.code, 2, (t % 8) == 4);
    }
    return msg.map(d => d.join(" ")).join("\r\n") + "\r\n";
}

function nexaManual(house) {
    var d = new Date();
    var now = d.toUnixTime();
    var msg = [];
    msg.push([now.toFixed(0)]);
    var addRow = (t, g, u, c) => msg.push([t, g, u, c ? 1 : 0].map(d=>d.toFixed(0)));
    var keys = ["indoor", "outdoor", "random"];
    for (var i in keys) {
        addRow(now, house.code, parseInt(i), house[keys[i]]);
    }
    return msg.map(d => d.join(" ")).join("\r\n") + "\r\n";
}

function nexaAuto(house) {
    var d = new Date();
    var lamps = house.createLamps();
    var msg = d.toUnixTime().toFixed(0) + "\r\n";
    for (var i in lamps) {
        msg += lamps[i].getControlString(d);
    }
    return msg;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    var h = "tjorn";
    if (req.query.bromma !== undefined)
        h = "bromma";
    var house = houses[h];
    var s;
    //var test = false;
    //if (req.query !== undefined)
    //    if (req.query.test !== undefined)
    //        test = true;
    if (house.test)
        s = nexaTest(house);
    else {
        if (house.auto)
            s = nexaAuto(house);
        else
            s = nexaManual(house);
    }
    res.set('Content-Type', 'text/plain');
    res.send(s);
});

module.exports = router;

//console.log(nexaManual());