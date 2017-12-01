(function () {
   
  'use strict';

  function TaskSearchController($log, $stateParams, toastr, DbActionService, UserService){
    
    var vm = this;
    vm.allTasks = [];
    vm.searchText = $stateParams.searchedText;
    var userInfo = {};
    
    var init = function() {
        userInfo.userId = UserService.getLoggedInUser().id;

        vm.fetchTasks();
        
        vm.orderByList = [
            {id: 'status', name:'Status'},
            {id:'assignedTo', name:'Assignee'},
            {id:'dueDate', name:'Due Date'}
        ];

        vm.orderByString = 'dueDate';
        vm.sortOrderDesc = true;
    };


    vm.fetchTasks = function () {
        
        var criteria = {};
        criteria.userId = userInfo.userId;

        var sortObj = {};
        sortObj[vm.orderByString] = vm.sortOrderDesc ?  -1 : 1;

        DbActionService.getAllTasks(criteria, sortObj)
            .then(function(response){
                vm.allTasks = response.data;
                $log.debug('Searched Result: ' + JSON.stringify(vm.allTasks));
            }, function(response){
                toastr.error(response.data.error_message, '[Error]');
            });         
    }

    init();
};

  angular.module('taskControllApp').controller('TaskSearchController',TaskSearchController);


})();