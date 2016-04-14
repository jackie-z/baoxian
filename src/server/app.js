import http from 'http';
import express from 'express';
import session from 'express-session';
import redis from 'connect-redis';
import passport from 'passport';
import path from 'path';
import logger from './common/logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import routes from './router';
import datasets from './datasets';
import config from 'config';
import httpProxy from 'http-proxy';

let app = express();
let RedisStore = redis(session);

app.use(bodyParser.json({
  limit: '1mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '1mb'
}));
app.use(cookieParser());
app.use(session({
  secret: config.session_secret,
  store: new RedisStore({
    port: config.redis_port,
    host: config.redis_host,
  }),
  resave: true,
  saveUninitialized: true,
}));

let server = http.createServer(app);

app.use('/json', routes);
app.use('/datasets', datasets);

// In development mode, we create a proxy server to forward all
// http request to the webpack-dev-server
if (config.watch) {
  let proxy = httpProxy.createProxyServer();
  app.all('*', function(req, res) {
    proxy.web(req, res, {
      target: 'http://localhost:' + config.ports.devServer
    });
  });
  proxy.on('error', function(e) {
    console.log('Could not connect to proxy, please try again...');
  });

} else {
  app.use(express.static(path.join(__dirname, '../../build/website')));
}

app.use(function(req, res, next) {
  var err = new Error(`Not Found : ${req.url}`);
  err.status = 404;
  next(err);
});

if (config.watch) {
  app.use(errorhandler());
} else {
  app.use(function(err, req, res, next) {
    logger.error(err);
    return res.status(500).send('500 status');
  });
}

export default server;
