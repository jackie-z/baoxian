// Utility function to register angular modules
// Its purpose is to enable the use es6 of classes for creating angular directives and factories
// Adapted from https://github.com/michaelbromley/angular-es6
// See also http://www.michaelbromley.co.uk/blog/350/exploring-es6-classes-in-angularjs-1-x

/**
 * A helper function to simplify registering Angular components and provide a consistent syntax for doing so.
 */
export default function registerAngularModule(appName, dependencies) {

  let app = angular.module(appName, dependencies);

  let originalDirective = app.directive;
  app.directive = _directive;

  let originalFactory = app.factory;
  app.factory = _factory;

  return app;

  function _directive(name, constructorFn) {

    constructorFn = _normalizeConstructor(constructorFn);

    if (!constructorFn.prototype.compile) {
      // create an empty compile function if none was defined.
      constructorFn.prototype.compile = () => {};
    }

    let originalCompileFn = _cloneFunction(constructorFn.prototype.compile);

    // Decorate the compile method to automatically return the link method (if it exists)
    // and bind it to the context of the constructor (so `this` works correctly).
    // This gets around the problem of a non-lexical "this" which occurs when the directive class itself
    // returns `this.link` from within the compile function.
    _override(constructorFn.prototype, 'compile', function() {
      return function() {
        originalCompileFn.apply(this, arguments);

        if (constructorFn.prototype.link) {
          return constructorFn.prototype.link.bind(this);
        }
      };
    });

    let factoryArray = _createFactoryArray(constructorFn);

    originalDirective(name, factoryArray);
    return app;
  }

  function _factory(name, constructorFn) {
    constructorFn = _normalizeConstructor(constructorFn);
    let factoryArray = _createFactoryArray(constructorFn);
    originalFactory(name, factoryArray);
    return app;
  }

  /**
   * If the constructorFn is an array of type ['dep1', 'dep2', ..., constructor() {}]
   * we need to pull out the array of dependencies and add it as an $inject property of the
   * actual constructor function.
   * @param input
   * @returns {*}
   * @private
   */
  function _normalizeConstructor(input) {
    let constructorFn;

    if (input.constructor === Array) {
      //
      let injected = input.slice(0, input.length - 1);
      constructorFn = input[input.length - 1];
      constructorFn.$inject = injected;
    } else {
      constructorFn = input;
    }

    return constructorFn;
  }

  /**
   * Convert a constructor function into a factory function which returns a new instance of that
   * constructor, with the correct dependencies automatically injected as arguments.
   *
   * In order to inject the dependencies, they must be attached to the constructor function with the
   * `$inject` property annotation.
   *
   * @param constructorFn
   * @returns {Array.<T>}
   * @private
   */
  function _createFactoryArray(constructorFn) {
    // get the array of dependencies that are needed by this component (as contained in the `$inject` array)
    let args = constructorFn.$inject || [];
    let factoryArray = args.slice(); // create a copy of the array
    // The factoryArray uses Angular's array notation whereby each element of the array is the name of a
    // dependency, and the final item is the factory function itself.
    factoryArray.push((...args) => {
      //return new constructorFn(...args);
      let instance = new constructorFn(...args);
      for (let key in instance) {
        if (instance.hasOwnProperty(key)) {
          instance[key] = instance[key];
        }
      }
      return instance;
    });

    return factoryArray;
  }

  /**
   * Clone a function
   * @param original
   * @returns {Function}
   */
  function _cloneFunction(original) {
    return function() {
      return original.apply(this, arguments);
    };
  }

  /**
   * Override an object's method with a new one specified by `callback`.
   * @param object
   * @param methodName
   * @param callback
   */
  function _override(object, methodName, callback) {
    object[methodName] = callback(object[methodName]);
  }

}
