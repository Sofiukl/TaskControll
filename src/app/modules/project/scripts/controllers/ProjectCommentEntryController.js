(function() {

	'use strict';

	function ProjectCommentEntryController(projectId, DbActionService, $uibModalInstance, toastr){
		var vm = this;

    vm.title = 'Add Project Attributes';
		vm.form = {};
		vm.form.comment = '';
    vm.form.startDate = new Date();
    vm.form.completionDate = new Date();

		vm.ok = function () {
    		$uibModalInstance.close();
  		};

  		vm.cancel = function () {
    		$uibModalInstance.dismiss('cancel');
  		};

  		vm.saveComment = function(){

  			DbActionService.updateProject(projectId, {description : vm.form.comment, startDate : vm.form.startDate, completionDate : vm.form.completionDate})
  			.then(function(updateText){
  				toastr.success(updateText.data.message,'[Success]')
  			})
  			.catch(function(error){
  				toastr.error(error.data.error_message)
  			});

  			vm.ok();
  		};


	}

	angular.module('taskControllApp')
		.controller('ProjectCommentEntryController', ProjectCommentEntryController);

})();