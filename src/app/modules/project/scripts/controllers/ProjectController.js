(function () {
   
  'use strict';

  function ProjectController($scope, $state, $interval, $log, $q, $uibModal, toastr, DbActionService, UserService,  FetchFeedService, TaskUnderProjectCountService, socket){
    
    var vm = this;
    vm.enableAddProj = false;
    vm.allProjects = [];
    var project = {};
    var functionHolder = {};    

    var init = function(){
        vm.project = project;

        project.name = '';
        project.description = '';
        project.status = '';
        project.userId = UserService.getLoggedInUser().id;

        functionHolder.fetchProjects();

        //common event listeners
        $scope.$on('socket:broadcast', function(event, data){
            $log.info('Clien got one message', event.name);
            if(!data.payload) {
                $log.error('Invalid message');
                return;
            }
            if(!data.source) {
                $log.error('Invalid source');
                return;
            }
            const message =  data.payload + ' by ' + data.source + '\n';
            toastr.info(message);
        })

        socket.emit('message', 'Dummy', 'Hey I am logged in');


    };

    functionHolder.fetchProjects = function () {
        
        var criteria = {};
        criteria.user_id = UserService.getLoggedInUser().id;
        $log.debug('criteria.user_id : ' + UserService.getLoggedInUser().id);
        criteria.status = 'Open';
        
        DbActionService.getAllProjects(criteria)
            .then(function(r){
                var projectsWithCountPromise = TaskUnderProjectCountService.getCountOfTaskUnderEachProject(r.data);
                projectsWithCountPromise.then(function(projectsWithCount){
                    $log.debug('projectsWithCount : ' + JSON.stringify(projectsWithCount));
                    vm.allProjects = projectsWithCount;
                }, function(reson){
                    toastr.error(reason, '[Error]');
                })
                
            }, function(r){
                toastr.error(r.data.error_message, '[Error]');
            });         
    };

    vm.resetProject = function(){
        vm.project = {};
        project.userId = UserService.getLoggedInUser().id;
        vm.clickedFeedBtn = true;
        vm.enableAddProj = false;
        vm.newFeedName = '';
    }

    functionHolder.isValidproject = function(){
        
        var validationMsgs = '';
        
        if(vm.project.name == ''){
            validationMsgs = 'Project name can not be empty.'
        }
        angular.forEach(vm.allProjects, function(project, index){
            if(project.name === vm.project.name.trim()){
                if(validationMsgs != ''){
                    validationMsgs = validationMsgs + '<br/> ';
                }
                 validationMsgs = validationMsgs + ' A project with same name already exist.';  
            }
        });

        if(validationMsgs !== ''){
            toastr.error(validationMsgs);
            return false;
        }
        return true;
    };
    
    init();
    $interval(functionHolder.fetchProjects, 60000);

    vm.handleSubmit = function(keyEvent){
        if(keyEvent.which === 13){
            functionHolder.saveProject();
        }
    };
    
    functionHolder.saveProject = function(){

        $log.debug('Please save project info ' + JSON.stringify(vm.project));

        if(functionHolder.isValidproject()){
            DbActionService.saveProject({name : vm.project.name, description : vm.project.description, userId : UserService.getLoggedInUser().id})
            .then(function(response){
                var criteria = {};
                criteria.user_id = UserService.getLoggedInUser().id;
                criteria.status = 'Open';
                criteria.name = vm.project.name;
                DbActionService.getAllProjects(criteria)
                    .then(function(response){
                        functionHolder.saveTaskFeedPromise(response.data[0]).then(function(result){
                            vm.allProjects.push(response.data[0]);
                            toastr.info('Saved project ' + result.name);
                        }, function(error){
                            toastr.error('Failt to save new project - as reason : <br/>' + error, '[Error]');
                        });

                }, function(response){
                        toastr.error(response.data.error_message, '[Error]');
                });

            }, function(response){
                toastr.error(response.data.error_message, '[Error]');
            });
        }

    };

    vm.deleteProject = function (index) {
         $log.debug('Inside vm.deleteProject()..' + index);
         
         if(confirm('Are you sure to delete this project?')){
             var project = vm.allProjects[index];
             
             DbActionService.deleteProject(project._id, UserService.getLoggedInUser().id).
             then(function (response) {
                return FetchFeedService.deleteFeedByName(project.name, UserService.getLoggedInUser().id);
             }).then(function(success){
                vm.allProjects.splice(index, 1);
                toastr.info('project ' + project.name + ' deleted.', '[success]');  
             }).catch(function(err){
                toastr.error(err.data.error_message, '[Error]');
             });
        }
    }

    functionHolder.saveTaskFeedPromise = function(enteredProject){
        var defer = $q.defer();
        var newFeed = {};
        newFeed.name = vm.project.name;
        newFeed.description = 'A view for project ' + vm.project.name;
        newFeed.status = 'Active';
        newFeed.userId = UserService.getLoggedInUser().id;
        newFeed.feed_criteria = vm.task;
        var task = {
            parentTask : enteredProject._id
        };
        newFeed.feed_criteria = task;
        
        FetchFeedService.saveFeed(newFeed)
        .then(function(response){
            vm.resetProject();
            defer.resolve(newFeed);
        }, function(response){
            toastr.error(response.data.error_message, '[Error]');
            defer.reject(response.data.error_message);
        });

        return defer.promise;
    }

    vm.redirectToRoute = function(projectName){
        var feed = {};
        FetchFeedService.getAllFeeds(
                    {
                    user_id : UserService.getLoggedInUser().id,
                    status : 'Active',
                    name : projectName
                    }
                )
                .then(function(response){
                    feed = response.data[0];
                    $log.debug('Retrieved one feed: ' + JSON.stringify(feed));
                    $state.go('root.home.viewTask', {feedId:feed.feed_id});
                }, function(response){
                    toastr.error(response.data.error_message, '[Error]');
                }); 
    };

    vm.open = function (index) {
        var project = vm.allProjects[index];
        var modalInstance = $uibModal.open({
            templateUrl : 'modules/project/views/partials/project.comment.entry.html',
            controller  : 'ProjectCommentEntryController',
            controllerAs : 'projectCommentEntry',
            resolve: {
                projectId: function () {
                    return project._id;
                }
            }
        });

        modalInstance.result.then(function () {
            //nothing to do now
        }, function () {
            $log.debug('Modal dismissed at: ' + new Date());
        });
    };

    vm.openAboutView = function (index) {
        var project = vm.allProjects[index];
        var modalInstance = $uibModal.open({
            templateUrl : 'modules/project/views/partials/project.comment.view.html',
            controller  : 'ProjectCommentViewController',
            controllerAs : 'projectCommentView',
            resolve: {
                projectId: function () {
                    return project._id;
                }
            }
        });

        modalInstance.result.then(function () {
            //nothing to do now
        }, function () {
            $log.debug('Modal dismissed at: ' + new Date());
        });
    };

  };

  angular.module('taskControllApp').controller('ProjectController',ProjectController);


})();