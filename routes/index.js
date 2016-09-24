var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var h = "tjorn";
    if (req.query.bromma !== undefined)
        h = "bromma";
    //console.log("#################" + h + " " + JSON.stringify(houses[h]));
    res.render('index', { id: h, title: houses[h].name, house: houses[h] });
});

module.exports = router;
