(function () {
	 
	'use strict';

	function HomeController($scope, $http, growl, $timeout, $state, $interval, $log, socket){
		
		var vm = this;
    	vm.label = "User Home";
	};


	angular.module('taskControllApp').controller('HomeController',HomeController);


})();