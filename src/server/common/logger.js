var log4js = require('log4js');
var env = process.env.NODE_ENV;

log4js.configure({
  appenders: [{
    type: 'console'
  }, {
    type: 'file',
    filename: 'logs/baoxian.log',
    category: 'baoxian'
  }]
});
var logger = log4js.getLogger('baoxian');
logger.setLevel('DEBUG');

module.exports = logger;
