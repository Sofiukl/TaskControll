(function () {
   
  'use strict';

  function TaskController($http, $log, toastr, DbActionService, UserService, MakePriorityService, FetchProjectsService, socket){
    
    var vm = this;
    var task = {};
    var user = {};
    vm.showFolderOption = false;
    vm.showFolderOption = false;
    vm.showDueDateOption = false;
    vm.firstStar = "none";
    vm.secondStar = "none";
    vm.thirdStar = "none"
    vm.projects = [];

    var init = function() {  
        vm.task = task;
        task.name = '';
        task.assignedTo = '';
        task.dueDate = '';
        task.status = '';
        task.parentTask = '';
        user.userId = UserService.getLoggedInUser().id;
        task.userId = user.userId;
        task.priority = 0;

        var defaultCriteria = {};
        defaultCriteria.status = 'Open';
        defaultCriteria.name = 'Default';

       FetchProjectsService.getAllProjects(user).then(function(projects){
            vm.projects = projects;
            task.parentTask = vm.projects [vm.projects.length - 1].id;
        }, function(r){
            toastr.error(r.data.error_message, '[Error]');
        });
    }

    vm.saveTask = function(){
        if(isValidTask()){
            
            var priority = MakePriorityService.encodePriority({ firstStar : vm.firstStar, secondStar : vm.secondStar, thirdStar : vm.thirdStar});
            vm.task.priority = priority;
            DbActionService.saveTask(vm.task)
            .then(function(response){
                uploadFile();
                resetTask();
                toastr.info('Saved new task', '[Success]');
            }, function(response){
                toastr.error(response.data.error_message, '[Error]');
            });
        }

        socket.emit('task save', 'Sofikulm', 'Hey saved new task');
        console.log('emitted new event..');
    };

    var resetTask = function(){
        vm.task = {};
        user.userId = UserService.getLoggedInUser().id;
    }

    var isValidTask = function(){
        
        var validationMsgs = '';
        
        if(vm.task.name == ''){
            validationMsgs = 'Task name can not be empty.'
        }
        if(vm.task.assignedTo == ''){
           validationMsgs = validationMsgs + ' Assigned To can not be empty.' 
        }
        if(validationMsgs !== ''){
            toastr.error(validationMsgs);
            return false;
        }
        return true;
    }
    vm.changePriorityClass = function(startPos){
        var x = 'none';
        if(startPos == 1 ){
            x = (vm.firstStar === "yellow-star-1")? "none" : "yellow-star-1" ;
            vm.firstStar = x;
        }
        else if(startPos == 2){
            x = (vm.secondStar === "yellow-star-2")? "none" : "yellow-star-2" ;
            vm.secondStar = x;
        }
        else if(startPos == 3){
            x = (vm.thirdStar === "yellow-star-3")? "none" : "yellow-star-3" ;
            vm.thirdStar = x;
        }
        
    }
    const uploadFile = function(){

        var file = vm.taskFile;
        var uploadUrl = "/api/task/attachement/upload";
        var fd = new FormData();
        fd.append('file', file);

        $http.post(uploadUrl,fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
          console.log("File Saved successfully!!");
        })
        .error(function(){
          console.log("File saving error!!");
        });
    };

    init();

  };

  angular.module('taskControllApp').controller('TaskController',TaskController);


})();