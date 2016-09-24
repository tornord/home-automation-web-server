var DayCount = (function () {
    'use strict';

    Date.prototype.ymdhms = function () {
        var d = this.clone();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        var s = d.toISOString();
        s = s.replace(/T/, " ").substring(0, 19);
        return s;
    };

    Date.prototype.ymd = function () {
        return this.ymdhms().substring(0, 10)
    };

    Date.prototype.ymdhm = function () {
        return this.ymdhms().substring(0, 16);
    };

    Date.prototype.addHours = function (h) {
        var t = this.getTime();
        return new Date(t + (60 * 60 * 1000) * h);
    };

    Date.prototype.totalHours = function () {
        if (isNaN(this.getTime()))
            return NaN;
        var r = this.getHours() + (this.getMinutes() + this.getSeconds() / 60) / 60;
        if (r < 0)
            r += 24;
        else if (r > 24)
            r -= 24;
        return r;
    };

    Date.prototype.date = function () {
        return new Date(this.setHours(0, 0, 0, 0));
    }

    Date.prototype.clone = function () {
        return new Date(this.getTime());
    }

    Date.prototype.addDays = function (days) {
        return new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + days, 0, 0, 0))
        //var res = this.clone();
        //res.setDate(res.getDate() + days);
        //return res;
    }

    Date.isLeapYear = function (year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    };

    Date.getDaysInMonth = function (year, month) {
        return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    };

    Date.prototype.getDaysInMonth = function () {
        return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
    };

    Date.prototype.addMonths = function (value) {
        var res = this.clone();
        var n = res.getDate();
        res.setDate(1);
        res.setMonth(res.getMonth() + value);
        res.setDate(Math.min(n, res.getDaysInMonth()));
        return res;
    };

    Date.prototype.dayOfYear = function () {
        let start = new Date(Date.UTC(this.getFullYear(), 0, 0));
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.floor((this - start) / oneDay);
    };

    Date.prototype.monthNumber = function () {
        return 12 * (this.getFullYear() - 1970) + this.getMonth();
    };

    Date.prototype.endOfMonth = function () {
        let m = this.getMonth();
        let y = this.getFullYear();
        return new Date(Date.UTC(y, m, Date.getDaysInMonth(y, m)));
    };

    Date.prototype.lastDayOfMonth = function () {
        return this.endOfMonth();
    };

    Date.prototype.toUnixTime = function () {
        return Math.floor(this.getTime() / 1000);
    }

    var firstEasterYear = 1990;
    var lastEasterYear = 2040;
    var easterDays = ["1990-04-15", "1991-03-31", "1992-04-19", "1993-04-11", "1994-04-03", "1995-04-16", "1996-04-07",
        "1997-03-30", "1998-04-12", "1999-04-04", "2000-04-23", "2001-04-15", "2002-03-31", "2003-04-20", "2004-04-11", "2005-03-27", "2006-04-16",
        "2007-04-08", "2008-03-23", "2009-04-12", "2010-04-04", "2011-04-24", "2012-04-08", "2013-03-31", "2014-04-20", "2015-04-05", "2016-03-27",
        "2017-04-16", "2018-04-01", "2019-04-21", "2020-04-12", "2021-04-04", "2022-04-17", "2023-04-09", "2024-03-31", "2025-04-20", "2026-04-05",
        "2027-03-28", "2028-04-16", "2029-04-01", "2030-04-21", "2031-04-13", "2032-03-28", "2033-04-17", "2034-04-09", "2035-03-25", "2036-04-13",
        "2037-04-05", "2038-04-25", "2039-04-10", "2040-04-01"].map(d=>(new Date(d)).dayOfYear());

    Date.prototype.isBusinessDay = function () {
        let w = this.getDay();
        if ((w == 6) || (w == 0))
            return false;
        let m = this.getMonth();
        let d = this.getDate();
        if (m == 0) //jan
            if ((d == 1) || (d == 6))
                return false;
        if (m == 11) //dec
            if ((d == 24) || (d == 25) || (d == 26) || (d == 31))
                return false;
        if (m == 4) //maj
            if (d == 1)
                return false;
        let y = this.getFullYear();
        if (m == 5) { //jun
            if (d == 6)
                return false;
            let w = (new Date(Date.UTC(y, 5, 19))).getDay();
            if (d == (25 - ((w + 1) % 7)))
                return false; // midsommar
        }
        if ((y >= firstEasterYear) && (y <= lastEasterYear)) {
            let e = this.dayOfYear() - easterDays[y - firstEasterYear];
            if ((e == -2) || (e == 1) || (e == 39)) // långfredag, annandag påsk och kristi himmelsfärd
                return false;
        }
        return true;
    };

    Date.prototype.nextBusinessDay = function () {
        let d = this;
        while (true) {
            d = d.addDays(1);
            if (d.isBusinessDay())
                return d;
        }
    };

    Date.prototype.previousBusinessDay = function () {
        let d = this;
        while (true) {
            d = d.addDays(-1);
            if (d.isBusinessDay())
                return d;
        }
    };

    Date.prototype.isLastBusinessDayOfMonth = function () {
        return (this.getMonth() != this.nextBusinessDay().getMonth());
    };

    Date.prototype.lastBusinessDayOfMonth = function () {
        let d = this.lastDayOfMonth();
        if (d.isBusinessDay())
            return d;
        return d.previousBusinessDay();
    };

}());

module.exports = DayCount;