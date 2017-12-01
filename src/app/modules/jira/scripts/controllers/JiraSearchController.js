(function () {
   
  'use strict';

  function JiraSearchController($log, $stateParams, toastr, FetchFromJiraService, UserService, DropdownService){
    
    var vm = this;
    vm.allJiraTasks = [];
    vm.searchText = '';
    var userInfo = {};
    
    var init = function() {
        userInfo.userId = UserService.getLoggedInUser().id;
        vm.jiraStatusList = DropdownService.dropdown.jiraTask.status;
    };


    vm.fetchJiraTasks = function () {
        
        var criteria = {};
        criteria.userId = userInfo.userId;
        criteria.jql = vm.searchText;
        console.log('vm.searchText: ' + vm.searchText);
        FetchFromJiraService.getAllTasks(criteria)
            .then(function(response){
                vm.allJiraTasks = response.data;
                $log.info('Searched Result from Jira: ' + JSON.stringify(vm.allJiraTasks));
                angular.forEach(vm.allJiraTasks, function(task, index) {
                        task.editing = false;
                });
            }, function(response){
                toastr.error(response.data.error_message, '[Error]');
            });         
    }

    vm.handleTaskEdit = function(taskId) {
            var task = null;
            vm.allJiraTasks.forEach(function(t) {
                if(t.key=== taskId){
                    task = t;
                    return;
                }
            });
            FetchFromJiraService.updateTask(task.key, task)
            .then(function(response) {
                            task.editing = false;
                            toastr.info('Task Updated', '[Success]');
            }, function(response) {
                            toastr.error(response.data.error_message, '[Error]');
            });
    };

    vm.cancelTaskEdit = function(taskId) {
            if (confirm('Are you sure to cancel the modification?')) {
                            
            }

    };

    init();

};


angular.module('taskControllApp').controller('JiraSearchController',JiraSearchController);


})();