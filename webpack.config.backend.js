// Webpack configuration for the backend server application

var path = require('path');
var fs = require('fs');
var webpack = require('webpack');

var appConfig = require('./config');

var nodeModules = {};
fs.readdirSync('node_modules')
  // Gather all node modules that are not binaries
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  // Creating an object with a key/value of each module name, and prefixing the value with "commonjs".
  // It enables to get the same require behaviour when importing the modules with node when working with webpack
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  // Server app entry point
  entry: [
    './src/server/main.js'
  ],
  // Inform webpack that we are targetting node and not the browser
  target: 'node',
  // Backend bundle output configuration
  output: {
    path: path.join(__dirname, 'build/server'),
    filename: 'backend.js'
  },
  // do not freeze __dirname and __filename when bundling with webpack
  node: {
    __dirname: false,
    __filename: false
  },
  // add node modules in externals, they will not be bundled by webpack
  externals: nodeModules,
  // Store/Load compiler state from/to a json file. This will result in persistent ids of modules and chunks.
  // This is required, when using Hot Code Replacement between multiple calls to the compiler.
  recordsPath: path.join(__dirname, 'build/server/_records'),
  // Webpack plugins used for the backend
  plugins: [
    // Provide lodash as global
    new webpack.ProvidePlugin({
      '_': 'lodash',
      '_math' : 'lodash-math'
    }),
    // Insert code at the top of the generated bundle file :
    //  - ensure window is undefined
    //  - add source map support to get a detailed stack trace when an exception is thrown
    new webpack.BannerPlugin('window = undefined; require("source-map-support").install();', {
      raw: true,
      entryOnly: false
    })
  ],
  // jshint configuration for the backend
  jshint: {
    // any jshint option http://www.jshint.com/docs/options/
    node: true,
    globals: {
      '_': false,
      '_math' : false
    }
  }
};
