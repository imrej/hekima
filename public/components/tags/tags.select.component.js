(function() {

'use strict';

var TagsSelectCtrl = function($resource, $timeout, toastr) {
  var vm = this;
  vm.searchTags = searchTag;
  vm.onSelectTag = onSelectTag;
  vm.removeTag = removeTag;
  vm.createTag = createTag;
  var tagsResource = $resource('/app/api/tags/:tagUri', {}, {
    'search': {
        method: 'GET',
        isArray: true
    },
    'upsert': {
        method: 'POST',
        isArray: false
    }
  });
  function createTag(tag) {
    vm.saving = true;
    tagsResource.upsert({
      valeur: tag.valeur,
    }).$promise.then(saved => {
      vm.saving = false;
      toastr.success("Sauvegarde du tag " + tag.valeur + " réussie");
      tag.uri = saved.uri;
    }).catch(err => {
      console.error(err);
      toastr.error("Une erreur est survenue lors de la sauvegarde");
      vm.saving = false;
    });
  }
  function removeTag(tag) {
    vm.tags = _.filter(vm.tags, src => src.uri !== tag.uri);
    $timeout(() => {
        if(vm.tagsChanged) {
            vm.tagsChanged();
        }
    }, 100);
  }
  function searchTag(input) {
    tagsResource.search({q: input}).$promise
    .then(tags => {
      vm.suggestionTags = _.filter(tags, src => _.findIndex(vm.tags, {uri: src.uri}) <= 0);
      if(input && input.length > 0) {
        vm.suggestionTags.push({
          valeur: input
        });
      }
    })
    .catch(err => {
      console.error(err);
      toastr.error("Erreur à la récupération des tags");
    });
  }
  function onSelectTag(tag) {
    vm.tags = vm.tags || [];
    vm.tags.push(tag);
    vm.suggestionTags = [];
    delete vm.tagTmp;
    if(vm.tagsChanged) {
      vm.tagsChanged();
    }
  }

}

angular.module('hekimaApp').component('tagsSelector', {
  templateUrl: 'components/tags/tags.select.component.html',
  bindings: {
    tags: '=',
    tagsChanged: '&'
  },
  controller: TagsSelectCtrl
});

})();
