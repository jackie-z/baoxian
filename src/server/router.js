var express = require('express');
var router = express.Router();

var site = require('./routes/site');

router.get('/', site.index);

module.exports = router;
