angular.module('hekimaApp', ['toastr', 'ngResource', 'ngAnimate', 'ui.select',  'ui.bootstrap', 'ui.bootstrap.tpls'])
  .controller('MainController', function($q, $http, $timeout, $resource, $uibModal, toastr) {
    var vm = this;
    vm.tags = [];
    vm.sources = [];
    vm.search = search;
    vm.openView = openView;
    vm.toggleCreate = toggleCreate;
    var hekimasResource = $resource('/app/api/hekimas/:hekimaUri', {}, {
      'get': {
          method: 'GET',
          isArray: false
      },
      'search': {
          method: 'GET',
          isArray: true
      },
      'upsert': {
          method: 'POST',
          isArray: false
      }
    });
    search();
    function openView(hekima) {
      doStartCreate(hekima);
    }
    function search() {
      vm.loading = true;
      var query = {
          sort: 'DESC',
          tags: _.map(vm.tags, t => t.uri),
          sources: _.map(vm.sources, s => s.uri)
      };
      hekimasResource.search(query).$promise.then(hekimas => {
        vm.loading = false;
        vm.hekimas = hekimas;
      }).catch(err => {
        console.error(err);
        toastr.error("Une erreur est survenue lors de la recherche");
        vm.loading = false;
      })
    }
    function toggleCreate() {
      if(vm.adding) {
        closeCreation();
      } else {
        doStartCreate({});
      }
    }
    function doStartCreate(originalHekima) {
      vm.adding = true;
      var modalInstance = $uibModal.open({
        component: 'hekimaModal',
        resolve: {
          hekima: function () {
            return {
              uri: originalHekima.uri,
              valeur: originalHekima.valeur,
              tags: originalHekima ? angular.copy(originalHekima.tags) : angular.copy(vm.tags),
              source: originalHekima ? angular.copy(originalHekima.source) : _.first(vm.sources)
            };
          }
        }
      });
      modalInstance.result.then(function (value) {
        if(value.code === 'confirm') {
          var hekima = value.hekima;
          vm.saving = true;
          hekimasResource.upsert({
            uri: hekima.uri,
            valeur: hekima.valeur,
            tags: _.map(hekima.tags, t => t.uri),
            source: hekima.source ? hekima.source.uri : ''
          }).$promise.then(saved => {
            vm.saving = false;
            toastr.success("Sauvegarde réussie");
            hekimasResource.get({hekimaUri: saved.uri}).$promise.then(fetched => {
              if(originalHekima && originalHekima.valeur) {
                originalHekima.tags = fetched.tags;
                originalHekima.source = fetched.source;
                originalHekima.valeur = fetched.valeur;
              } else {
                vm.hekimas = vm.hekimas || [];
                vm.hekimas.unshift(fetched);
              }
            })
            closeCreation();
          }).catch(err => {
            console.error(err);
            toastr.error("Une erreur est survenue lors de la sauvegarde");
            vm.saving = false;
            closeCreation();
          });
        } else {
          closeCreation();
        }
      });
    }
    function closeCreation() {
      vm.adding = false;
    }
    bootstrap();
    function bootstrap() {
    }
  });
