(function() {
'use strict';

function SourceModalCtrl($resource, toastr) {
  var vm = this;
  vm.cancel = cancel;
  vm.confirm = confirm;
  vm.$onInit = onInit;
  var sourcesResource = $resource('/app/api/sources/:sourceUri', {}, {
      'search': {
          method: 'GET',
          isArray: true
      },
      'upsert': {
          method: 'POST',
          isArray: false
      }
  });
  function confirm() {
    vm.saving = true;
      sourcesResource.upsert(vm.source).$promise.then(saved => {
        vm.saving = false;
        toastr.success("Sauvegarde de la source " + saved.titre + " réussie");
        vm.close({$value : {code:'confirm', source: saved}});
    }).catch(err => {
        console.error(err);
        toastr.error("Une erreur est survenue lors de la sauvegarde");
        vm.saving = false;
    });

  }
  function cancel() {
    vm.close({$value : {code:'cancel'}});
  }
  function onInit() {
    vm.source = angular.copy(vm.resolve.source);
  }
}

angular.module('hekimaApp')
.component('sourceModal', {
  templateUrl: 'components/sources/source.modal.html',
  bindings: {
    resolve : '<',
    close: '&',
    dismiss: '&'
  },
  controller: SourceModalCtrl
});

})();
