import ParallelCoordsDirective from './parallelcoords.directive';

let parallelcoordsModule = registerAngularModule('parallelcoords', [])
  .directive('parallelcoords', ParallelCoordsDirective);

export default {
  module: parallelcoordsModule,
  name: 'Parallel Coordinates',
  url: 'parcoords',
  template: '<parallelcoords></parallelcoords>'
};
