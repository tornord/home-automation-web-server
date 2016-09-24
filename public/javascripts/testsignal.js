var s = require("./signal");

var s1 = new s.Signal([[0, false], [1, true], [2, false]]);
var s2 = new s.Signal([[0, true], [0.5, false], [1.5, true]]);

if (s1.or(s2).toString() != "[[0, true], [0.5, false], [1, true]]")
    console.log("or error");
if (s1.or(s2.not).toString() != "[[0, false], [0.5, true], [2, false]]")
    console.log("or-not error");
if (s1.and(s2).toString() != "[[0, false], [1.5, true], [2, false]]")
    console.log("and error");
if (s1.and(s2.not).toString() != "[[0, false], [1, true], [1.5, false]]")
    console.log("and-not error");
if (s1.and(s2.not).or(s1.not.and(s2)).toString() != "[[0, true], [0.5, false], [1, true], [1.5, false]]")
    console.log("xor error");
