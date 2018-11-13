'use strict';

angular.module('hekimaApp')
  .directive('loadingPane',function () {
    return {
      restrict: 'E',
      templateUrl: 'components/misc/loadingpane/loadingpane.html'
    };
  });
