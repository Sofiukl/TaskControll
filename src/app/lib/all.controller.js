(function () {
	 
	'use strict';

	function DashboardController($scope, $http, growl, $timeout, $state, $interval, $log, FetchFeedService , UserService, TaskCountService, DashboardViewService, toastr){
		
		var vm = this;
		vm.activeView = DashboardViewService.getActiveView();
		vm.activeViewClass = DashboardViewService.getActiveViewClass();
		
		vm.fetchAllFeeds = function () {
        	
	        FetchFeedService.getAllFeeds(
	                {
	                user_id : UserService.getLoggedInUser().id,
	                status : 'Active'
	                }
	            )
	            .then(function(response){
	                var modifiedFeedPromise = TaskCountService.getCountForAllTaskFeed(response.data);
                    modifiedFeedPromise.then(function(feedArrayWithCount){
                    	vm.allFeeds = feedArrayWithCount;
                    });
	            }, function(response){
	                toastr.error(response.data.message, '[Error]');
	            });         
    	};

    	vm.refreshFeedCount = function(index){
    		var feed = vm.allFeeds[index];
    		var feedArr = [];
    		feedArr.push(feed);

    		var feedWithCount = TaskCountService.getCountForAllTaskFeed(feedArr);
    		feed = feedWithCount;

    	};

    	vm.changeViewType = function(index) {
    		DashboardViewService.changeViewType(index);
    		
    		vm.activeView = DashboardViewService.getActiveView();
			vm.activeViewClass = DashboardViewService.getActiveViewClass();

    	};

    	vm.deleteFeed = function (index) {
	         $log.debug('Inside vm.deleteFeed()..' + index);
	         
	         var feed = vm.allFeeds[index];
	         
	         FetchFeedService.deleteFeedByName(feed.name, UserService.getLoggedInUser().id)
	         .then(function(success){
	            vm.allFeeds.splice(index, 1);
	            toastr.info('Feed ' + feed.name + ' deleted.', '[success]');  
	         }).catch(function(err){
	            toastr.error(err.data.error_message, '[Error]');
	         });
    	};

    	vm.fetchAllFeeds();

    	$interval(vm.fetchAllFeeds, 60000);

	};


	angular.module('taskControllApp').controller('DashboardController',DashboardController);


})();;(function () {
	 
	'use strict';

	function HomeController($scope, $http, growl, $timeout, $state, $interval, $log, socket){
		
		var vm = this;
    	vm.label = "User Home";
	};


	angular.module('taskControllApp').controller('HomeController',HomeController);


})();;(function () {
   
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


})();;(function () {
	 
	'use strict';

	function LogInController($scope, $http, growl, $log, $timeout, $state, $rootScope, $stateParams, LoginService, UserService, $auth, toastr, socket){

		var vm = this;
		
		vm.userName = undefined;
		vm.userPassword = undefined;
		vm.userRole = undefined;

		vm.login = function(){
			$auth.login({email : vm.userName, password : vm.userPassword})
    		.then(function(response) {
    			toastr.success('Welcome in Next Generation !', 'Hi '+ response.data.user.username);
  				$rootScope.userRole = response.data.user.role;
  				var user = response.data.user;
  				UserService.setLoggedInUser({id: user._id, name : user.username, password : null, role : user.role});
  				socket.emit('new user', UserService.getLoggedInUser());
  				$log.debug('Welcome to task controll..');
  				$state.go('root.home.dashboard');
    		})
    		.catch(function(error) {
      			toastr.error(error.data.message, 'Unauthorized Access!!!');
    		});
		};


	    $scope.isAuthenticated = function() {
      		return $auth.isAuthenticated();
    	};
	    
	    $scope.authenticate = function(provider) {
	      $auth.authenticate(provider)
	        .then(function(response) {
	          toastr.success('You have successfully logged in with ' + provider + '!', 'Hi '+ response.data.user.displayName);
  			  $rootScope.userRole = response.data.user.role;
  			  var user = response.data.user;
  			  UserService.setLoggedInUser({id:user._id, name : user.displayName, password : null, role : user.role});
	          $state.go('root.home.dashboard');
	        })
	        .catch(function(error) {
	          if (error.message) {
	          	toastr.error(error.message, 'Unauthorized Access!!!');
	            toastr.error(error.message);
	          } else if (error.data) {
	            toastr.error(error.data.message, 'Unauthorized Access!!!');
	          } else {
	          	toastr.error('You have failed to log in!!');
	          }
	        });
	    };

	};

	angular.module('taskControllApp').controller('LogInController',LogInController);


})();;(function(){

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

		vm.redirectToLogIn = function () {
			 $state.go('login');
		}
		
		vm.expireSession = function(){

		    if (!$auth.isAuthenticated()) { return; }
		    $auth.logout()
		      .then(function() {
		          toastr.info('You have successfully logged out.');
		          $state.go('login');
		      });

		}

		$rootScope.$on('unAuthorizedAccess', function(data){
			toastr.info('You don\'t have permission to access this.');
		});

	};

	angular.module('taskControllApp')
		.controller('menuController', MenuController);

})();;(function() {

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

})();;(function() {

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

})();;(function () {
   
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


})();;(function(){

	function HeaderController($state, $rootScope, $http, $state, $auth, toastr, $log) {
	
		var vm = this;
		vm.header = 'Menu Items';
		vm.searchBarWidth = '250px';
		vm.searchedText = '';

		vm.isAuthenticated = function(){
			return $auth.isAuthenticated();
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

		vm.focusEventOnSearchBox = function(){
			vm.searchBarWidth = '500px';
		}	

		vm.searchTasks = function (keypressEvent) {
			if(keypressEvent.which === 13){
            	toastr.info('You have Searched with text ' + vm.searchedText);
            	$state.go('root.home.viewSearchedTask', {searchedText : vm.searchedText});
			}
		}

	};

	angular.module('taskControllApp')
		.controller('HeaderController', HeaderController);

})();;(function(){

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

})();;(function () {
   
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


})();;(function () {
   
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


})();;(function () {
   
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


})();;(function() {

    'use strict';

    function TaskViewController($scope, $state, $log, toastr, DbActionService, UserService, FetchFeedService, feedInfo, moment, MakePriorityService, DropdownService, FetchProjectsService, socket, PaginationService) {

        var vm = this;
        vm.allTasks = [];
        vm.currentTasks = [];
        vm.labels = [];
        vm.data = [];
        vm.chartStatuslabels = [];
        vm.chartStatusData = [];
        vm.projects = [{ name: '', id: '' }];
        vm.firstStar = "none";
        vm.secondStar = "none";
        vm.thirdStar = "none"
        vm.searchText = '';
        var task = {};
        var userInfo = {};
        vm.pager = {};

        var init = function() {
            vm.task = task;
            task.name = '';
            task.assignedTo = '';
            task.dueDate = '';
            task.parentTask = '';
            task.priority = 0;
            userInfo.userId = UserService.getLoggedInUser().id;
            userInfo.name = UserService.getLoggedInUser().name;
            //retrieve feed criteria
            angular.forEach(feedInfo.data, function(value, index) {
                            vm.feedName = value.name;
                            vm.task = value.feed_criteria;

                            if (value.feed_criteria.parentTask) {
                                            vm.task.parentTask = value.feed_criteria.parentTask;
                            }

                            if (value.feed_criteria.priority && value.feed_criteria.priority != 0) {
                                            var priorityObj = MakePriorityService.decodePriority(value.feed_criteria.priority);
                                            if (priorityObj.firstStar) {
                                                            vm.firstStar = priorityObj.firstStar;
                                            }
                                            if (priorityObj.secondStar) {
                                                            vm.secondStar = priorityObj.secondStar;
                                            }
                                            if (priorityObj.thirdStar) {
                                                            vm.thirdStar = priorityObj.thirdStar;
                                            }
                            }

            });

            FetchProjectsService.getAllProjects(userInfo).then(function(projects) {
                            vm.projects = projects;
            }, function(r) {
                            toastr.error(r.data.error_message, '[Error]');
            });
            
            datePopulator();
            vm.fetchTasks();
            vm.statusList = DropdownService.dropdown.task.status;
            vm.orderByList = DropdownService.dropdown.task.orderBy;

            vm.orderByString = 'dueDate';
            vm.sortOrderDesc = true;

        };


        var datePopulator = function() {
            if (vm.task.dueDate == '$today') {
                            vm.task.dueDate = moment().format('DD/MM/YYYY');
            }
            if (vm.task.dueDate == '$tomorrow') {
                            var today = moment();
                            var tomorrow = today.add(1, 'days')
                            vm.task.dueDate = moment(tomorrow).format('DD/MM/YYYY');

            }
            if (vm.task.dueDate == '$nextWeek') {
                            var today = moment();
                            var nextWeek = today.add('days', 7)
                            vm.task.dueDate = moment(nextWeek).format('DD/MM/YYYY');

            }
        }

        vm.fetchTasks = function() {

            var criteria = {};
            criteria.userId = userInfo.userId;
            criteria.status = vm.task.status;

            if (vm.task.dueDate && vm.task.dueDate != '') {
                            criteria.dueDate = vm.task.dueDate;
            }
            if (vm.task.name && vm.task.name != '') {
                            criteria.name = vm.task.name;
            }
            if (vm.task.assignedTo && vm.task.assignedTo != '') {
                            criteria.assignedTo = vm.task.assignedTo;
            }
            if (vm.task.parentTask && vm.task.parentTask != '') {
                            criteria.parentTask = vm.task.parentTask;
            }
            var priority = MakePriorityService.encodePriority({ firstStar: vm.firstStar, secondStar: vm.secondStar, thirdStar: vm.thirdStar });
            if (priority != 0) {
                            criteria.priority = priority;
            }

            var sortObj = {};

            sortObj[vm.orderByString] = vm.sortOrderDesc ? -1 : 1;

            DbActionService.getAllTasks(criteria, sortObj)
                .then(function(response) {
                                vm.allTasks = response.data;

                                console.log(JSON.stringify(vm.allTasks));

                                angular.forEach(vm.allTasks, function(task, index) {
                                        task.editing = false;
                                        task.parentTask.id = task.parentTask._id;
                                });

                                vm.initPagination();

                                /*vm.noOfPages = Math.ceil(vm.allTasks.length / vm.numPerPage);
                                alert('vm.noOfPages: ' + vm.noOfPages);
                                
                                vm.setPage();*/

                                vm.labels = [];
                                vm.data = [];
                                vm.chartStatuslabels = [];
                                vm.chartStatusData = [];

                                const arrChartObjs = [];
                                var asssigneeChartColor = ['#FFA700', '#949FB1', '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#4D5360'];
                                var colorIndex = 0;
                                angular.forEach(vm.allTasks, function(task, index) {
                                        
                                        if(arrChartObjs.length == 0){
                                            var newObj = {};
                                            newObj.key = task.assignedTo;
                                            newObj.count = 1;
                                            newObj.color = asssigneeChartColor[colorIndex];
                                            colorIndex = colorIndex + 1;
                                            arrChartObjs.push(newObj);
                                        }else {
                                            var isExist = false;
                                            angular.forEach(arrChartObjs, function(obj){
                                                if(task.assignedTo == obj.key){
                                                    obj.count = obj.count +1;
                                                    isExist = true;
                                                }
                                            })

                                            if(!isExist){
                                                var newObj = {};
                                                newObj.key = task.assignedTo;
                                                newObj.count = 1;
                                                newObj.color = asssigneeChartColor[colorIndex];
                                                colorIndex = colorIndex + 1;
                                                arrChartObjs.push(newObj);
                                            }
                                           
                                        }

                                        
                                });

                                
                               vm.colors = [];

                               vm.options = {cutoutPercentage: 75};

                               angular.forEach(arrChartObjs, function(obj){
                                    vm.labels.push(obj.key);
                                    vm.data.push(obj.count);
                                    vm.colors.push(obj.color);
                                })


                                var arrStatusChartObjs = [];
                                var statusChartColor = ['#00ADF9', '#803690', '#DCDCDC', '#FDB45C', '#949FB1', '#46BFBD', '#4D5360'];
                                colorIndex = 0;
                                angular.forEach(vm.allTasks, function(task, index) {

                                        if(arrStatusChartObjs.length == 0){
                                            var newObj = {};
                                            newObj.key = task.status;
                                            newObj.count = 1;
                                            newObj.color = statusChartColor[colorIndex];
                                            colorIndex = colorIndex + 1;
                                            arrStatusChartObjs.push(newObj);
                                        }else {
                                            var isExist = false;
                                            angular.forEach(arrStatusChartObjs, function(obj){
                                                if(task.status == obj.key){
                                                    obj.count = obj.count +1;
                                                    isExist = true;
                                                }
                                            })

                                            if(!isExist){
                                                var newObj = {};
                                                newObj.key = task.status;
                                                newObj.count = 1;
                                                newObj.color = statusChartColor[colorIndex];
                                                colorIndex = colorIndex + 1;
                                                arrStatusChartObjs.push(newObj);
                                            }
                                           
                                        }

                                        
                                });

                                vm.statusChartcolors = [];

                                angular.forEach(arrStatusChartObjs, function(obj){
                                    vm.chartStatuslabels.push(obj.key);
                                    vm.chartStatusData.push(obj.count);
                                    vm.statusChartcolors.push(obj.color);
                                })


                }, function(response) {
                                toastr.error(response.data.error_message, '[Error]');
                });
        }


        vm.enableNewFeedInput = function() {
            vm.clickedFeedBtn = true;
        }

        vm.saveNewFeed = function() {

            var newFeed = {};
            newFeed.name = vm.newFeedName;
            newFeed.description = 'A new custom feed';
            newFeed.status = 'Active';
            newFeed.userId = userInfo.userId;

            var priority = MakePriorityService.encodePriority({ firstStar: vm.firstStar, secondStar: vm.secondStar, thirdStar: vm.thirdStar });
            vm.task.priority = priority;

            newFeed.feed_criteria = vm.task;


            FetchFeedService.saveFeed(newFeed)
                            .then(function(response) {
                                            toastr.info('Saved new feed', '[Success]');
                                            vm.clickedFeedBtn = true;
                                            vm.newFeedName = '';
                            }, function(response) {
                                            $log.debug('Error response: \n ' + JSON.stringify(response));
                                            toastr.error(response.data.error_message, '[Error]');
                            });

        }

        vm.updateTask = function (taskId) {
            var task = null;
            vm.allTasks.forEach(function(t) {
                if(t._id === taskId){
                    task = t;
                    alert(task.editing);
                    return;
                }
            });

            task.editing = true;
        }

        vm.handleTaskEdit = function(taskId) {
            var task = null;
            vm.allTasks.forEach(function(t) {
                if(t._id === taskId){
                    task = t;
                    return;
                }
            });
            
            vm.projects.forEach(function(p){
                if(p.name === 'Default'){
                    task.parentProjectId = p.id;
                }
            });

            vm.projects.forEach(function(p){
                if(p.id === task.parentTask.id){
                    task.parentTask.name = p.name;
                }
            });


            DbActionService.updateTask(task._id, task)
                            .then(function(response) {
                                            task.editing = false;
                                            toastr.info('Task Updated', '[Success]');
                            }, function(response) {
                                            toastr.error(response.data.error_message, '[Error]');
                            });
            //create event information for sharing
            const event = {
                message : 'Hey!! One task shared with you'
            };

            const creator = {
                id : userInfo.userId,
                name : userInfo.name
            };

            const listener = {
                      id : '',
                      name : task.sharedWith  
            };
            const listeners = [];
            listeners.push(listener);

            socket.emit('share', creator, listeners, event);
            console.log('emitted task share event..');

        };

        vm.cancelTaskEdit = function(taskId) {
            if (confirm('Are you sure to cancel the modification?')) {
                            var task = null;
                            vm.allTasks.forEach(function(t) {
                                if(t._id === taskId){
                                    task = t;
                                    return;
                                }
                            });
                            DbActionService.getTask(task._id, userInfo.userId)
                                            .then(function(response) {
                                                            task.name = response.data[0].name;
                                                            task.status = response.data[0].status;
                                                            task.assignedTo = response.data[0].assignedTo;
                                                            task.sharedWith = response.data[0].sharedWith;
                                                            task.editing = false;
                                                            toastr.info('Task update cancelled', '[Success]');
                                            }, function(response) {
                                                            toastr.error(response.data.error_message, '[Error]');
                                            });
            }

        };

        vm.deleteTask = function(taskId) {
            if (confirm('Are you sure to delete the task feed?')) {
                var task = null;
                vm.allTasks.forEach(function(t) {
                    if(t._id === taskId){
                        task = t;
                        return;
                    }
                });

                DbActionService.deleteTask(task._id, userInfo.userId)
                                .then(function(response) {
                                                var newList = vm.allTasks.filter(function(obj){
                                                    return obj._id !== taskId
                                                })
                                                vm.allTasks = newList;
                                                toastr.info('Task deleted', '[Success]');
                                }, function(response) {
                                                toastr.error(response.data.error_message, '[Error]');
                                });
            }

        };

        /*vm.sortTaskList = function(){
            var criteria = {};
            criteria.userId = userInfo.userId;
            criteria.status = vm.task.status;
            
            if(vm.task.dueDate && vm.task.dueDate != ''){
                criteria.dueDate = vm.task.dueDate;
            }
            if(vm.task.name && vm.task.name != ''){
                criteria.name = vm.task.name;
            }
            if(vm.task.assignedTo && vm.task.assignedTo != ''){
                criteria.assignedTo = vm.task.assignedTo;
            }
            var priority = MakePriorityService.encodePriority({ firstStar : vm.firstStar, secondStar : vm.secondStar, thirdStar : vm.thirdStar});

            if(priority != 0){
                criteria.priority = priority;
            }
            if(vm.task.parentTask && vm.task.parentTask != ''){
                criteria.parentTask = vm.task.parentTask;
            }
            var sortKey = vm.orderByString;
            var sortValue = vm.sortOrderDesc;

            var sortObj = {};
            sortObj[sortKey] = sortValue ?  -1 : 1;

            DbActionService.getAllTasks(criteria, sortObj)
                .then(function(response){
                    vm.allTasks = response.data;
                    angular.forEach(vm.allTasks, function(task,index){
                        task.editing = false;
                    });

                }, function(response){
                    toastr.error(response.data.error_message, '[Error]');
            });
        };*/
        vm.changePriorityClass = function(startPos) {
            var x = 'none';
            if (startPos == 1) {
                            x = (vm.firstStar === "yellow-star-1") ? "none" : "yellow-star-1";
                            vm.firstStar = x;
            } else if (startPos == 2) {
                            x = (vm.secondStar === "yellow-star-2") ? "none" : "yellow-star-2";
                            vm.secondStar = x;
            } else if (startPos == 3) {
                            x = (vm.thirdStar === "yellow-star-3") ? "none" : "yellow-star-3";
                            vm.thirdStar = x;
            }

        };

        vm.getDataForReport = function(){
            var data = [];
            angular.forEach(vm.allTasks, function(task,index){
                var t = {};
                t.name = task.name;
                t.priority = task.priority;
                t.parent = task.parentTask.name;
                t.assignedTo = task.assignedTo;
                t.dueDate = task.dueDate;
                t.status = task.status;
                data.push(t);
            });
            return data;
        }
        
        vm.initPagination = function () {
            var pager = PaginationService.getPager(2,vm.allTasks.length);
            vm.pager = pager;
            vm.currentPage = 1;
            vm.totalPages = pager.totalPages;
            vm.recordPerPage = pager.recordPerPage;
            vm.currentTasks = vm.allTasks.slice(vm.pager.getStartIndex(),vm.pager.getEndIndex());
        }

        init();
    };


    angular.module('taskControllApp').controller('TaskViewController', TaskViewController);


})();
