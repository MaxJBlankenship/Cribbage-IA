var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/lobby', function(req, res) {
  res.render('lobby', { title: 'Express' });
});

module.exports = router;
