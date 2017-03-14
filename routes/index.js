var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // use the Index file in Views and pass Express to the title property.
  // res.render is used to render a specified template along with the named
  // values of named variables passed in an object and then send that result as a response
  res.redirect('/catalog');
});

module.exports = router;
