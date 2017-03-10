var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// the pattern is /users/cool
router.get('/cool', function(req, res){
  res.send("You're sooo cooooolll!!!");
});

module.exports = router;
