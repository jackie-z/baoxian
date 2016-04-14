import template from './radarplots.html';
import controller from './radarplots.controller';

import './radarplots.css';

import RadarChart from 'common/radarChart';

class RadarplotsDirective {
  constructor() {
    this.restrict = 'E';
    this.scope = {};
    this.template = template;
    this.controller = controller;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element) {
    this.scope = scope;
    this.element = element;
    scope.$on('data_ready', () => this.createVisualization());
    scope.vm.requestRandomData(3);
  }

  // adapted from http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
  createVisualization() {
    let processedData = _.map(this.scope.vm.data, d => {
      let ret = [];
      _.forOwn(d, (v, k) => ret.push({
        'axis': k,
        'value': (v - this.scope.vm.dataStats[k].min) /
          (this.scope.vm.dataStats[k].max - this.scope.vm.dataStats[k].min)
      }));
      return ret;
    });
    var margin = {
        top: 100,
        right: 100,
        bottom: 100,
        left: 100
      },
      width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
      height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 100);

    var radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 1.0,
      levels: 5,
      roundStrokes: true
    };

    //Call function to draw the Radar chart
    RadarChart("#radar-plots-div", processedData, radarChartOptions);
  }


}

export default RadarplotsDirective;
