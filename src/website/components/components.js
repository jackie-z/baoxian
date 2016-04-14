function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

var reqContext = require.context("./", true, /^.*\/index\.js$/);

var components = requireAll(reqContext);

var componentsName = _.map(components, (c) => c.module.name);

let componentsModule = registerAngularModule('app.components', componentsName)
  .config(($stateProvider, $urlRouterProvider) => {

    'ngInject';

    $urlRouterProvider.otherwise(components[0].url);

    _.each(components, (c) =>
      $stateProvider
      .state(c.url, {
        url: '/' + c.url,
        template: c.template
      })
    );

  });

export default {
  module: componentsModule,
  componentsList: components
};
