class ParallelcoordsController {
  /*@ngInject*/
  constructor($scope, $http) {
    this.name = 'parallelcoords';
    this.$http = $http;
    this.$scope = $scope;
  }

  requestData() {
    this.$http.get('datasets/cars').then(response => {
      this.data = response.data;
      this.$scope.$emit('data_ready');
    });
  }

}

export default ParallelcoordsController;
