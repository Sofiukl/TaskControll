(function() {

	'use strict';

	function ProjectCommentViewController(projectId, DbActionService, $uibModalInstance, toastr, UserService){
		var vm = this;

    vm.title = 'View Project Attributes';
		vm.form = {};
		vm.form.description = '';
    vm.form.startDate = '';
    vm.form.completionDate = '';

		vm.ok = function () {
    		$uibModalInstance.close();
  	};

		vm.cancel = function () {
  		$uibModalInstance.dismiss('cancel');
		};

  	//load attributes from database using projectId
    DbActionService.getProject(projectId, UserService.getLoggedInUser().id)
        .then(function(project){
          vm.form.description = project.data[0].description;
          vm.form.startDate = project.data[0].startDate;
          vm.form.completionDate = project.data[0].completionDate;
        })
        .catch(function(error){
          toastr.error(error.data.error_message)
        });


	}

	angular.module('taskControllApp')
		.controller('ProjectCommentViewController', ProjectCommentViewController);

})();