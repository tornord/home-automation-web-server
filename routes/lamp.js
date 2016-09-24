"use strict";
require("./daycount");
var SunCalc = require("./suncalc");
var Lamp = (function () {
    function Lamp(house, unit, wakeUp, goToBed, weekendWakeUp, weekendGoToBed, lat, lon, deg) {
        this.house = house;
        this.unit = unit;
        this.wakeUp = wakeUp;
        this.goToBed = goToBed;
        this.weekendWakeUp = weekendWakeUp;
        this.weekendGoToBed = weekendGoToBed;
        this.lat = lat;
        this.lon = lon;
        this.deg = deg;
    }
    Lamp.hourToString = function (d) {
        var f = function (r) { var s = r.toFixed(0); return ((s.length == 1) ? "0" : "") + s; };
        var h = Math.floor(d);
        return f(h) + ":" + f(60 * (d - h));
    };
    Lamp.prototype.toString = function () {
        return Lamp.hourToString(this.wakeUp) + "-" + Lamp.hourToString(this.goToBed) + " (" +
            Lamp.hourToString(this.weekendWakeUp) + "-" + Lamp.hourToString(this.weekendGoToBed) + ")";
    };
    Lamp.prototype.getState = function (d) {
        var sun = SunCalc.getTimes(d, this.lat, this.lon, this.deg);
        var sunrise = sun[0].totalHours();
        var sunset = sun[1].totalHours();
        var t = d.totalHours();
        var w = d.getDay();
        var wakeUp = this.wakeUp;
        var goToBed = this.goToBed;
        var midday = 12.0;
        if ((w == 6) || (w == 0))
            wakeUp = this.weekendWakeUp;
        if (t < midday) {
            if ((w == 6) || (w == 0))
                goToBed = this.weekendGoToBed;
        }
        else if ((w == 5) || (w == 6))
            goToBed = this.weekendGoToBed;
        if ((t <= sunrise) || (t >= sunset)) {
            if (goToBed == wakeUp)
                return 1;
            if (goToBed < midday)
                if ((t < goToBed) || (t >= wakeUp))
                    return 1;
            if ((t < goToBed) && (t >= wakeUp))
                return 1;
        }
        return 0;
    };
    Lamp.prototype.nextSwitch = function (d0) {
        d0 = new Date(d0.clone().setSeconds(60));
        var s0 = this.getState(d0);
        var m = 1;
        while (true) {
            if (m > (24 * 60))
                return [d0.addHours(24), d0];
            var d = new Date(d0.getTime() + (60 * 1000 * m));
            var s = this.getState(d);
            if (s != s0)
                return [d, s];
            m++;
        }
    };
    Lamp.prototype.setRandomHours = function (d) {
        var y = d.dayOfYear();
        var h1 = 22 + ((237 * y + 151) % 180) / 60;
        if (h1 >= 24)
            h1 -= 24;
        var h2 = 6 + ((219 * y + 191) % 180) / 60;
        this.goToBed = h1;
        this.wakeUp = h2;
        this.weekendGoToBed = h1 + ((h1 > 23) ? -23 : 1);
        this.weekendWakeUp = h2 + 1;
    };
    Lamp.prototype.getControlString = function (d) {
        var s = this.getState(d);
        var n = this.nextSwitch(d);
        return d.toUnixTime() + " " + this.house + " " + this.unit + " " + s + "\r\n" +
            n[0].toUnixTime() + " " + this.house + " " + this.unit + " " + n[1] + "\r\n";
    };
    return Lamp;
}());
exports.Lamp = Lamp;
//# sourceMappingURL=lamp.js.map