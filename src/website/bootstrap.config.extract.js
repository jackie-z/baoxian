var globalBootStrapConfig = require('./bootstrap.config');
globalBootStrapConfig.styleLoader = require('extract-text-webpack-plugin').extract('style-loader', 'css-loader!postcss-loader!less-loader');

module.exports = globalBootStrapConfig;
