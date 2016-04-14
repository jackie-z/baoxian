class RadarplotsController {
  /*@ngInject*/
  constructor($scope, $http, $q) {
    this.name = 'radarplots';
    this.$scope = $scope;
    this.$http = $http;
    this.$q = $q;
  }

  requestRandomData(nbData = 3) {
    this.$http.get('datasets/cars/stats').then(response => {
      let nbCars = response.data.count;
      let requests = [];
      for (let i = 0; i < nbData; ++i) {
        requests.push(this.$http.get('datasets/cars/' + ((Math.random() * nbCars) | 0)));
      }
      let numericProps = _.keys(_.pick(response.data.propertiesTypes, (v, k) => v === 'number'));
      this.$q.all(requests).then((values) => {
        this.dataStats = response.data.numericalPropertiesStats;
        this.data = _.map(values, v => _.pick(v.data, numericProps));
        this.$scope.$emit('data_ready');
      });
    });
  }
}

export default RadarplotsController;
