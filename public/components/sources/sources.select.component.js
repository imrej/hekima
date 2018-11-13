(function() {

'use strict';

var SourcesSelectCtrl = function($uibModal, $resource, toastr) {
  var vm = this;
  vm.searchSource = searchSource;
  vm.onSelectSource = onSelectSource;
  vm.removeSource = removeSource;
  vm.createSource = createSource;
  var sourcesResource = $resource('/app/api/sources/:sourceUri', {}, {
    'search': {
        method: 'GET',
        isArray: true
    }
  });
  function createSource(source) {
      var modalInstance = $uibModal.open({
          component: 'sourceModal',
          resolve: {
              source: () => source
          }
      });
      modalInstance.result.then(function (value) {
        if(value.code === 'confirm') {
          vm.suggestionSources = [];
          onSelectSource(value.source);
        }
      });
  }
  function removeSource(source) {
    vm.sources = _.filter(vm.sources, src => src.uri !== source.uri);
    if(vm.sourcesChanged) {
      vm.sourcesChanged();
    }
  }
  function searchSource(input) {
    sourcesResource.search({q: input}).$promise
    .then(sources => {
      vm.suggestionSources = _.filter(sources, src => _.findIndex(vm.sources, {uri: src.uri}) <= 0);
      if(input && input.length > 0 && _.indexOf(vm.suggestionSources, src => src.titreRecherche === input.toLowerCase())<0) {
          vm.suggestionSources.push({
              titre: input
          });
      }
    })
    .catch(err => {
      console.error(err);
      toastr.error("Erreur à la récupération des sources");
    });
  }
  function onSelectSource(source) {
    if(source.uri) {
        vm.sources = vm.sources || [];
        vm.sources.push(source);
        vm.suggestionSources = [];
        delete vm.sourceTmp;
        if(vm.sourcesChanged) {
            vm.sourcesChanged();
        }
    }
  }

}

angular.module('hekimaApp').component('sourcesSelector', {
  templateUrl: 'components/sources/sources.select.component.html',
  bindings: {
    sources: '=',
    sourcesChanged: '&'
  },
  controller: SourcesSelectCtrl
});

})();
