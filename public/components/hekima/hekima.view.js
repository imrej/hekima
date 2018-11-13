(function() {
'use strict';

function HekimaViewCtrl() {
  var vm = this;
}

angular.module('hekimaApp')
.component('hekimaView', {
  templateUrl: 'components/hekima/hekima.view.html',
  bindings: {
    hekima : '<'
  },
  controller: HekimaViewCtrl
});

})();
