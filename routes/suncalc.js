var SunCalc = (function () {
    'use strict';
    var PI = Math.PI, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, atan = Math.atan2, acos = Math.acos, rad = PI / 180;
    var dayMs = 1000 * 60 * 60 * 24, J1970 = 2440588, J2000 = 2451545;
    function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
    function fromJulian(j) { return new Date((j + 0.5 - J1970) * dayMs); }
    function toDays(date) { return toJulian(date) - J2000; }
    var e = rad * 23.4397;
    function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
    function declination(l, b) { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }
    function azimuth(H, phi, dec) { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
    function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }
    function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }
    function astroRefraction(h) {
        if (h < 0)
            h = 0;
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }
    function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }
    function eclipticLongitude(M) {
        var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), P = rad * 102.9372;
        return M + C + P + PI;
    }
    function sunCoords(d) {
        var M = solarMeanAnomaly(d), L = eclipticLongitude(M);
        return {
            dec: declination(L, 0),
            ra: rightAscension(L, 0)
        };
    }
    function getPosition(date, lat, lng) {
        var lw = rad * -lng, phi = rad * lat, d = toDays(date), c = sunCoords(d), H = siderealTime(d, lw) - c.ra;
        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: altitude(H, phi, c.dec)
        };
    }
    ;
    var times = [
        [-0.833, 'sunrise', 'sunset'],
        [-0.3, 'sunriseEnd', 'sunsetStart'],
        [-6, 'dawn', 'dusk'],
        [-12, 'nauticalDawn', 'nauticalDusk'],
        [-18, 'nightEnd', 'night'],
        [6, 'goldenHourEnd', 'goldenHour']
    ];
    function addTime(angle, riseName, setName) {
        times.push([angle, riseName, setName]);
    }
    ;
    var J0 = 0.0009;
    function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }
    function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
    function solarTransitJ(ds, M, L) { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }
    function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
    function getSetJ(h, lw, phi, dec, n, M, L) {
        var w = hourAngle(h, phi, dec), a = approxTransit(w, lw, n);
        return solarTransitJ(a, M, L);
    }
    function getTimes(date, lat, lng, deg) {
        var lw = rad * -lng, phi = rad * lat, d = toDays(date), n = julianCycle(d, lw), ds = approxTransit(0, lw, n), M = solarMeanAnomaly(ds), L = eclipticLongitude(M), dec = declination(L, 0), Jnoon = solarTransitJ(ds, M, L), i, len, time, Jset, Jrise;
        Jset = getSetJ(deg * rad, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);
        return [fromJulian(Jrise), fromJulian(Jset)];
    }
    ;
    var res = {};
    res.getTimes = getTimes;
    res.getPosition = getPosition;
    return res;
}());
module.exports = SunCalc;
//# sourceMappingURL=suncalc.js.map