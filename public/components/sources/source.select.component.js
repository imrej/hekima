(function() {

'use strict';

var SourceSelectCtrl = function($resource, toastr) {
  var vm = this;
  vm.searchSource = searchSource;
  vm.onSelectSource = onSelectSource;
  vm.removeSource = removeSource;
  var sourcesResource = $resource('/app/api/sources/:sourceUri', {}, {
    'search': {
        method: 'GET',
        isArray: true
    }
  });

  function removeSource(source) {
    delete vm.source;
    if(vm.sourceChanged) {
      vm.sourceChanged();
    }
  }
  function searchSource(input) {
    sourcesResource.search({q: input}).$promise
    .then(sources => {
      vm.suggestionSources = _.filter(sources, src => _.findIndex(vm.sources, {uri: src.uri}) <= 0);
    })
    .catch(err => {
      console.error(err);
      toastr.error("Erreur à la récupération des sources");
    });
  }
  function onSelectSource() {
    if(vm.sourceChanged) {
      vm.sourceChanged();
    }
  }

}

angular.module('hekimaApp').component('sourceSelector', {
  templateUrl: 'components/sources/source.select.component.html',
  bindings: {
    source: '=',
    sourceChanged: '&'
  },
  controller: SourceSelectCtrl
});

})();
