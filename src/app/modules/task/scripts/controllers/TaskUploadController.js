(function () {
   
  'use strict';

  function TaskUploadController($http, $log, toastr, DbActionService, UserService, MakePriorityService, FetchProjectsService, socket){
    
    var vm = this;
    vm.taskUploadFile = '';
    vm.projects = [];
    var user = {};

    var init = function() {  
        user.userId = UserService.getLoggedInUser().id;
        getAllProjects();
    }
    const getAllProjects = function(){

        FetchProjectsService.getAllProjects(user).then(function(projects){
            vm.projects = projects;
            alert(JSON.stringify(projects));
        }, function(r){
            toastr.error(r.data.error_message, '[Error]');
        });
    }

    vm.saveTask = function(){
        if(isValidTask()){

            const taskUploadPromise = new Promise( function(resolve, reject) {
                    uploadFile();
                    resolve();
            });

            taskUploadPromise.then(function (){
                resetTask();
                toastr.info('Saved new task', '[Success]');    
            })
                
        }
    };

    var resetTask = function(){
        vm.taskUploadFile = '';
        user.userId = UserService.getLoggedInUser().id;
    }

    var isValidTask = function(){
        
        var validationMsgs = [];
        
        if(vm.taskUploadFile == ''){
            validationMsgs.push('Please upload the file');
        }
        //TODO validate file size
        const fileTypes = ['json'];
        var file = vm.taskUploadFile;
        if (file) {
            var extension = file.name.split('.').pop().toLowerCase(),
            isValidFile = fileTypes.indexOf(extension) > -1;
            if(!isValidFile){
                validationMsgs.push('Please upload JSON file');
            }
        }
        
        if(validationMsgs.length != 0){
            validationMsgs.forEach(function(msg){
                toastr.error(msg);    
            })
            return false;
        }
        return true;
    }
    
    const uploadFile = function(){

        var file = vm.taskUploadFile;  
        
        //read file contents

        if (file) {

            var aReader = new FileReader();

            aReader.readAsText(file, "UTF-8");

            aReader.onload = function (evt) {
                const fileContent = aReader.result;
                vm.tasks = JSON.parse(fileContent);
                vm.tasks.forEach(function(task){
                    task.status = task.status || 'Open';
                    //populating parent task id
                    vm.projects.forEach(function(p){
                        if(p.name == task.parent) {
                            task.parentTask = p.id;
                            alert('task.parentTask: ' + task.parentTask);
                        }
                    })
                })

                var uploadUrl = "/api/task/upload/json";
                var fd = new FormData();
                fd.append('file', file);
                fd.append('userId', user.userId);

                $http.post(uploadUrl,fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function(){
                  console.log("File Saved successfully!!");
                })
                .error(function(){
                  console.log("File saving error!!");
                  toastr.error(response.data.error_message, '[Error]');
                });
               
            }

            aReader.onerror = function (evt) {
               const fileContent = "error";
                toastr.error('Fail to parse uploaded tasks');
            }
        }
    };

    init();

  };

  angular.module('taskControllApp').controller('TaskUploadController',TaskUploadController);


})();