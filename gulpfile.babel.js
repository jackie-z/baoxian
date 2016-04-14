import minimist from 'minimist';
import appConfig from './config';
import gulp from 'gulp';
import webpack from 'webpack';
import path from 'path';
import DeepMerge from 'deep-merge';
import colors from 'colors';
import {spawn} from 'child_process';
import del from 'del';
import ProgressPlugin from 'webpack/lib/ProgressPlugin';
import ProgressBar from 'progress';
import nodemon from 'nodemon';
import WebpackDevServer from 'webpack-dev-server';
import defaultConfig from './webpack.config.common';
import prettify from 'gulp-jsbeautifier';

let argv = minimist(process.argv.slice(2));
if (argv['NODE_ENV'] != null) {
  process.env.NODE_ENV = argv['NODE_ENV'];
}

let deepmerge = DeepMerge((target, source, key) => {
  if (target instanceof Array) {
    return [].concat(target, source);
  }
  return source;
});

let config = (overrides) => {
  return deepmerge(defaultConfig, overrides || {});
};

// Webpack configuration for the frontend Web application
let frontendConfig = config(require('./webpack.config.frontend'));

// Webpack configuration for the backend server application
let backendConfig = config(require('./webpack.config.backend'));

let buildError = false;

// Callback function called when webpack has terminated a build process
function onBuild(done) {
  return function(err, stats) {
    if (err) {
      buildError = true;
      console.log(err.red);
    } else {
      buildError = buildError || stats.compilation.errors.length > 0;
      console.log(stats.toString({
        colors: true
      }));
    }
    if (done) {
      done();
    }
  }
};

// Display a progress bar in the console output when compiling a webpack project
function webpackProgress(compiler, headingMessage) {
  let bar = new ProgressBar(' '+ headingMessage + ' [:bar] :percent : :message', {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: 100
  });
  let lastPercentage = 0;
  compiler.apply(new ProgressPlugin((percentage, msg) => {
    if (percentage > lastPercentage) {
      bar.update(percentage, {'message' : msg});
      lastPercentage = percentage;
    } else {
      bar.update(lastPercentage, {'message' : msg});
    }
    if (lastPercentage === 1) {
      lastPercentage = 0;
    }
  }));
}

// Gulp task to build the frontend bundle
gulp.task('frontend-build', (done) => {
  // First, clean the previous frontend build
  del(['build/website/**/*']);
  let compiler = webpack(frontendConfig);
  webpackProgress(compiler, 'Compiling frontend');
  compiler.run(onBuild(done));
});

// Gulp task to start a Webpack development server to get hot reloading
// of the frontend when source files change
gulp.task('frontend-watch', (done) => {
  // First, clean the previous frontend build
  del(['build/website/**/*']);

  let initialCompile = true;
  let compiler = webpack(frontendConfig);
  webpackProgress(compiler, 'Compiling frontend');
  compiler.plugin('done', (stats) => {
    buildError = stats.compilation.errors.length > 0;
    if (initialCompile) {
      console.log(('Webpack Dev Server listening at localhost:' + appConfig.ports.devServer).green.bold);
      initialCompile = false;
      done();
    }
  });

  new WebpackDevServer(compiler, {
    contentBase: 'build/website',
    hot: true,
    stats: {
      colors: true
    }
  }).listen(appConfig.ports.devServer, 'localhost', function(err, result) {
    if (err) {
      console.log(err);
    }
  });

});

// Gulp task to build the backend bundle
gulp.task('backend-build', ['frontend-build'], (done) => {
  // First, clean the previous backend build
  del(['build/server/**/*']);
  let compiler = webpack(backendConfig);
  webpackProgress(compiler, 'Compiling backend');
  compiler.run(onBuild(done));
});

// Gulp task to watch any changes on source files for the backend application.
// The server will be automatically restarted when it happens.
gulp.task('backend-watch', ['frontend-watch'], (done) => {
  // First, clean the previous backend build
  del(['build/server/**/*']);
  let firedDone = false;
  let compiler = webpack(backendConfig);
  webpackProgress(compiler, 'Compiling backend');
  compiler.watch(100, (err, stats) => {
    onBuild()(err, stats);
    if (!firedDone) {
      firedDone = true;
      done();
    }
    nodemon.restart();
  });
});

// Gulp task to build the frontend and backend bundles
gulp.task('build', ['backend-build']);

// Gulp task to start the application in development mode :
// hot reloading of frontend + automatic restart of the backend if needed
gulp.task('watch', ['backend-watch'], () => {
  // Don't start the express server as there was some errors during the webpack compilation
  if (buildError) process.exit();
  let firstStart = true;
  nodemon({
    execMap: {
      js: 'node'
    },
    script: path.join(__dirname, 'build/server/backend'),
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop'
  }).on('restart', () => {
    if (firstStart) {
      console.log('Starting express server !'.green.bold);
      firstStart = false;
    } else {
      console.log('Restarting express server !'.green.bold);
    }
  });
});

// Gulp task to start the application in production mode :
// the server is launched through the forever utility.
// It allows to automatically restart it when a crash happens.
gulp.task('run', ['build'], (done) => {
  // Don't start the express server as there was some errors during the webpack compilation
  if (buildError) process.exit();
  let server = spawn('./node_modules/.bin/forever', ['./build/server/backend.js'], {
    stdio: "inherit"
  });

  server.on('close', (code) => {
    console.log('Server process exited with code ' + code);
    done();
  });

});

// Ensure that all child processes are killed when hitting Ctrl+C in the console
process.once('SIGINT', () => {
  process.exit();
});

// ===================================================================================

// Gulp task to beautify js source files trough js-beautify
// Configuration can be found in the .jsbeautifyrc file

let paths = {
  frontendScripts: ['src/website/**/*.js'],
  backendScripts: ['src/server/**/*.js'],
};

gulp.task('beautify-js', () => {
  gulp.src(paths.frontendScripts.concat(paths.backendScripts), {
      base: './'
    })
    .pipe(prettify({
      config: path.join(__dirname, '.jsbeautifyrc'),
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./'))
});
