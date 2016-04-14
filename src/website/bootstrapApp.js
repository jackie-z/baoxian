let appModule = require('./app');

if (__PROD__) {
  appModule.config(($compileProvider, $httpProvider) => {
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync(true);
  });
}

angular.element(document).ready(() => {
  document.body.innerHTML = '<app> Loading... </app>';
  angular.bootstrap(document, [appModule.name], {});
});
