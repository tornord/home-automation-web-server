"use strict";
require("./daycount");
var SunCalc = require("./suncalc.js");
var lamp_1 = require("./lamp");
var House = (function () {
    function House(name, code, lat, long, wakeUp, goToBed, weekendWakeUp, weekendGoToBed) {
        this.name = name;
        this.code = code;
        this.lat = lat;
        this.long = long;
        this.wakeUp = wakeUp;
        this.goToBed = goToBed;
        this.weekendWakeUp = weekendWakeUp;
        this.weekendGoToBed = weekendGoToBed;
        this.test = false;
        this.auto = true;
        var d = new Date();
        var lamps = this.createLamps();
        this.indoor = lamps[0].getState(d) == 1;
        this.outdoor = lamps[1].getState(d) == 1;
        this.random = lamps[2].getState(d) == 1;
    }
    House.prototype.latlongToString = function (x) {
        var h = Math.floor(x);
        var r = 60 * (x - h);
        var m = Math.floor(r);
        var s = 60 * (r - m);
        return h.toFixed(0) + "°" + m.toFixed(0) + "'" + s.toFixed(0);
    };
    Object.defineProperty(House.prototype, "positionString", {
        get: function () {
            return this.latlongToString(this.lat) + ", " + this.latlongToString(this.long);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(House.prototype, "sunTimesString", {
        get: function () {
            var sun = SunCalc.getTimes(new Date(), this.lat, this.long, -0.833);
            var sunrise = sun[0].totalHours();
            var sunset = sun[1].totalHours();
            return lamp_1.Lamp.hourToString(sunrise) + " - " + lamp_1.Lamp.hourToString(sunset);
        },
        enumerable: true,
        configurable: true
    });
    House.prototype.createLamps = function () {
        var res = [];
        var d = new Date();
        var degs = [0.5, -1.0, 0.5];
        for (var i in degs) {
            var lamp = new lamp_1.Lamp(this.code, parseInt(i), this.wakeUp, this.goToBed, this.weekendWakeUp, this.weekendGoToBed, this.lat, this.long, degs[i]);
            if (i == "2")
                lamp.setRandomHours(d);
            res.push(lamp);
        }
        return res;
    };
    return House;
}());
exports.House = House;
//# sourceMappingURL=house.js.map