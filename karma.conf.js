module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: ['*.js'],
        exclude: ['karma.conf.js'],
        reporters: ['progress','coverage'],
		coverageReporter: {
			type : 'html',
			dir : 'coverage/'
		},
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome','FireFox'],
        captureTimeout: 60000,
        singleRun: false
    });
};