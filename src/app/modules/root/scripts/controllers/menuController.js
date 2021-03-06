(function(){

	function MenuController($state, $rootScope, $http, UserService, LoginService, $state, $auth, toastr) {
	
		var vm = this;
		vm.header = 'Menu Items';
		vm.loggedInUser = UserService.getLoggedInUser().name;
		vm.menuList = [
			{
				name : 'Client Management',
				link : '#',
				subMenu : [
					{
						name : 'Client Entry',
						link : '/clientEntry'
					},
					{
						name : 'Client Amend',
						link : '/clientAmend'
					},
					{
						name : 'Client Cancel',
						link : '/clientCancel'
					}
				]
			},
			{
				name : 'Sys Controll',
				link : '/sysControll',
				subMenu : []
			}

		];

		vm.isAuthenticated = function(){
			return $auth.isAuthenticated();
		}

		vm.redirectToLogIn = function () {
			 $state.go('root.login');
		}
		
		vm.expireSession = function(){

		    if (!$auth.isAuthenticated()) { return; }
		    $auth.logout()
		      .then(function() {
		          toastr.info('You have successfully logged out.');
		          $state.go('root.login');
		      });

		}

		$rootScope.$on('unAuthorizedAccess', function(data){
			toastr.info('You don\'t have permission to access this.');
		});

	};

	angular.module('taskControllApp')
		.controller('MenuController', MenuController);

})();