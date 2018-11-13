(function() {
'use strict';

function HekimaModalCtrl() {
  var vm = this;
  vm.cancel = cancel;
  vm.confirm = confirm;
  vm.$onInit = onInit;
  function confirm() {
    vm.close({$value : {code:'confirm', hekima: vm.hekima}});
  }
  function cancel() {
    vm.close({$value : {code:'cancel'}});
  }
  function onInit() {
    vm.hekima = angular.copy(vm.resolve.hekima);
  }
}

angular.module('hekimaApp')
.component('hekimaModal', {
  templateUrl: 'components/hekima/hekima.modal.html',
  bindings: {
    resolve : '<',
    close: '&',
    dismiss: '&'
  },
  controller: HekimaModalCtrl
});

})();
