// Webpack configuration for the frontend Web application

var path = require('path');
var webpack = require('webpack');

var appConfig = require('./config');

// resolve path to minified angular dist
var pathToAngular = path.resolve(__dirname, 'node_modules/angular/angular.min.js');

// extract css in non watch mode (don't extract in watch mode as we want hot reloading of css)
if (!appConfig.watch) {

  // the extract-text-webpack-plugin for extracting stylesheets in a separate css file
  var ExtractTextPlugin = require('extract-text-webpack-plugin');

}

// require the html-webpack-plugin for automatic generation of the index.html file
// of the web application
var HtmlWebpackPlugin = require('html-webpack-plugin');

// require CSS autoprefixer for PostCSS
var autoprefixer = require('autoprefixer');

module.exports = {
  // Cache generated modules and chunks to improve performance for multiple incremental builds.
  cache: true,
  resolve: {
    // Replace modules by other modules or paths.
    alias: {
      // set angular to the minified dist for faster build
      'angular': pathToAngular,
      // alias the registerAngularModule script
      'registerAngularModule': path.resolve(__dirname, 'src/website/utils/registerAngularModule.js')
    },
    // The root directory (absolute path) that contains the application modules,
    // enables to import modules relatively to it
    root: path.resolve(__dirname, 'src/website')
  },
  // Application entry points
  entry: {
    // Generate a vendors bundle containing external modules used in every part of the application.
    // It is a good practice to do so as the code it contains is unlikely to change during the application lifetime.
    // This will allow you to do updates to your application, without requiring the users to download the vendors bundle again
    // See http://dmachat.github.io/angular-webpack-cookbook/Split-app-and-vendors.html for more details
    vendors: ['angular', 'angular-ui-router',
              !appConfig.watch ? './src/node_modules/bootstrap-webpack!./src/website/bootstrap.config.extract.js' :
              './src/node_modules/bootstrap-webpack!./src/website/bootstrap.config.js', 'jquery',
              'lodash'
    ],
    // The frontend application entry point (bootstrapApp.js)
    // In development mode, we also add webpack-dev-server specific entry points
    app: (!appConfig.watch ? [] : ['webpack/hot/dev-server',
      'webpack-dev-server/client?http://localhost:' + appConfig.ports.devServer
    ]).concat(['./src/website/bootstrapApp.js']),
  },
  // The output configuration of the build process
  output: {
    // Directory that will contain the frontend application assets
    // (except when using the webpack-dev-server in development as all generated files are stored in the dev-server memory)
    path: path.join(__dirname, 'build/website'),
    // Patterns of the names of the files to generate.
    // In production, we concatenate the content hash of each file for long term caching
    // See https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.rgsrbt29e
    filename: appConfig.production ? "[name].[chunkhash].js" : "[name].js",
    chunkFilename: appConfig.production ? "[id].[chunkhash].js" : "[id].js"
  },
  // Specific module loaders for the frontend
  module: {
    loaders: [
      // Load html files as raw strings
      {
        test: /\.html$/,
        loader: 'raw'
      },
      // Load css files through the PostCSS preprocessor first, then through the classical css and style loader.
      // In production mode, extract all the stylesheets to a separate css file (improve loading performances of the application)
      {
        test: /\.css$/,
        loader: !appConfig.watch ? ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader') : 'style!css!postcss'
      },

      // Loaders for the font files (bootstrap, font-awesome, ...)
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file'
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      }
    ],
    // Disable parsing of the minified angular dist as it is not needed and it speeds up the webpack build
    noParse: [pathToAngular]
  },
  // CSS preprocessor configuration (PostCSS)
  postcss: [
    // use autoprefixer feature (enable to write your CSS rules without vendor prefixes)
    // see https://github.com/postcss/autoprefixer
    autoprefixer()
  ],
  // Webpack plugins used for the frontend
  plugins: [
    // Identifies common modules and put them into a commons chunk (needed to generate the vendors bundle)
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      minChunks: Infinity
    }),
    // Automatically loaded modules available in all source files of the application
    // (no need to explicitely import them)
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      '_': 'lodash',
      'registerAngularModule': 'registerAngularModule'
    }),
    // Automatically generate the index.html file including all webpack generated assets
    new HtmlWebpackPlugin({
      title: 'Webpack Angular Test',
      template: 'src/website/index.tpl.html'
    })
  ].concat(!appConfig.watch ?
  [
    // Extract stylesheets to separate CSS file in production mode
    new ExtractTextPlugin(appConfig.production ? '[name].[contenthash].css' : '[name].css')
  ] :
  [
    // Need to use that plugin in development mode to get hot reloading on source files changes
    new webpack.HotModuleReplacementPlugin({
      quiet: true
    })
  ]),

  // Options for jshint
  jshint: {
    // don't warn about undefined variables as they are provided
    // to the global scope by webpack ProvidePlugin
    globals: {
      '_': false,
      '$': false,
      'jQuery': false,
      'angular': false,
      'registerAngularModule': false
    }
  }
};
