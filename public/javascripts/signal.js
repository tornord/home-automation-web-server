"use strict";
var SignalItem = (function () {
    function SignalItem(timestamp, value) {
        if (value === void 0) { value = undefined; }
        if (timestamp instanceof SignalItem) {
            this.timestamp = timestamp.timestamp;
            this.value = timestamp.value;
        }
        else if (timestamp instanceof Array) {
            if (timestamp.length >= 2) {
                this.timestamp = timestamp[0];
                this.value = timestamp[1];
            }
        }
        else {
            this.timestamp = timestamp;
            this.value = value;
        }
    }
    Object.defineProperty(SignalItem.prototype, "clone", {
        get: function () {
            return new SignalItem(this.timestamp, this.value);
        },
        enumerable: true,
        configurable: true
    });
    SignalItem.prototype.toString = function () {
        return "[" + this.timestamp + ", " + this.value + "]";
    };
    return SignalItem;
}());
var Signal = (function () {
    function Signal(items) {
        this.items = [];
        for (var i in items) {
            this.items.push(new SignalItem(items[i]));
        }
    }
    Object.defineProperty(Signal.prototype, "clone", {
        get: function () {
            var res = new Signal([]);
            for (var i = 0; i < this.items.length; i++)
                res.items.push(this.items[i].clone);
            return res;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "not", {
        get: function () {
            var res = this.clone;
            for (var i = 0; i < res.items.length; i++)
                res.items[i].value = !res.items[i].value;
            return res;
        },
        enumerable: true,
        configurable: true
    });
    Signal.prototype.valueAt = function (t) {
        for (var i = this.items.length - 1; i >= 0; i--) {
            var m = this.items[i];
            if (t >= m.timestamp)
                return m.value;
        }
        return undefined;
    };
    Signal.prototype.unionTimestamps = function (s2) {
        var s1 = this;
        if (s1.items.length == 0)
            return s2.items.map(function (d) { return d.timestamp; });
        var res = [];
        var n2 = 0;
        var t1 = s1.items[0].timestamp;
        while (true) {
            if (n2 >= s2.items.length)
                break;
            var t2 = s2.items[n2].timestamp;
            if (t2 > t1)
                break;
            n2++;
        }
        for (var n1 = 0; n1 < s1.items.length; n1++) {
            var t1_1 = s1.items[n1].timestamp;
            while (true) {
                if (n2 >= s2.items.length)
                    break;
                var t2 = s2.items[n2].timestamp;
                if (t2 >= t1_1)
                    break;
                res.push(t2);
                n2++;
            }
            res.push(t1_1);
        }
        return res;
    };
    Signal.prototype.binaryOperator = function (s2, oper) {
        var s1 = this;
        var ts = s1.unionTimestamps(s2);
        var v1s = ts.map(function (d) { return s1.valueAt(d); });
        var v2s = ts.map(function (d) { return s2.valueAt(d); });
        var vs = [];
        var v = undefined;
        for (var i = 0; i < ts.length; i++) {
            var t = ts[i];
            var vn = oper(s1.valueAt(t), s2.valueAt(t));
            if ((v === undefined) && (vn === undefined))
                continue;
            if (vn === undefined)
                continue;
            if (v == vn)
                continue;
            v = vn;
            vs.push(new SignalItem(t, v));
        }
        return new Signal(vs);
    };
    Signal.prototype.and = function (s2) {
        return this.binaryOperator(s2, function (d1, d2) { return (d1 && d2); });
    };
    Signal.prototype.or = function (s2) {
        return this.binaryOperator(s2, function (d1, d2) { return (d1 || d2); });
    };
    Signal.prototype.toString = function () {
        return "[" + this.items.map(function (d) { return d.toString(); }).join(", ") + "]";
    };
    return Signal;
}());
exports.Signal = Signal;
//# sourceMappingURL=signal.js.map