(function() {
  'use strict';

  var app = angular.module('taskControllApp', ['ngTouch', 'ui.bootstrap', 'ui.grid', 'ui.grid.selection', 'ui.grid.exporter', 'ui.bootstrap.pagination', 'ui.router' , 'as.sortable', 'ngSanitize', 'ngCsv', 'angular-growl', 'toastr', 'satellizer', 'angularMoment', 'btford.socket-io', 'chart.js'])
  .constant('USER_ROLES',  {
	  all: '*',
	  admin: 'admin',
	  editor: 'editor',
	  normaluser: 'normaluser',
	  guest: 'guest'	
  });

  app.filter('startFrom', function(){
  	
		return function(data,start){
  			return data.slice(start);
  	}
    
  });

  app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
  }]);


})();
