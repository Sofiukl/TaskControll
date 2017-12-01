(function () {
	 'use strict';

	 function TaskUnderProjectCountService ($log, $q, UserService, MakePriorityService, DbActionService, TaskCountService, FetchFeedService) {
	 	 
	 	 var serviceObj = {};

	 	 serviceObj.getCountOfTaskUnderEachProject = getCountOfTaskUnderEachProject;

	 	 function getCountOfTaskUnderEachProject(projectArray) {
	 	 	
	 	 	var defer = $q.defer();
	 	 	var promises = [];
	 	 	var projectArrayWithCount = [];
	 	 	
	 	 	function findProjectWiseTaskCount(project, index) {

		 	 	var defer = $q.defer();
		 	 	console.log('project in promise: ' + JSON.stringify(project));
		 	 	var projectName = project.name;

		 	 	FetchFeedService.getAllFeeds(
                    {
                    user_id : UserService.getLoggedInUser().id,
                    status : 'Active',
                    name : projectName
                    }
                )
                .then(function(response){
                    var feed = response.data[0];
                    console.log('feed: ' + JSON.stringify(feed));
                    var modifiedFeedPromise = TaskCountService.getCountForAllTaskFeed([feed]);


                    modifiedFeedPromise.then(function(feedArrayWithCount){
                    	project.taskCount = feedArrayWithCount[0].taskCount;
                    	projectArrayWithCount.push(project);
                    	defer.resolve(project);
                    });

                    
                }, function(response){
                    toastr.error(response.data.error_message, '[Error]');
                    defer.reject('Fail to find task count..');
                });

	        	return defer.promise;
	        }

	        function lastTask() {
	        	defer.resolve(projectArrayWithCount)
	        }

	 	 	angular.forEach(projectArray, function(project, index){
	 	 		promises.push(findProjectWiseTaskCount(project,index));
	 	 	});
		 	
		 	$q.all(promises).then(lastTask);

		 	return defer.promise;
		}
	 	 
	 	 return serviceObj; 
	 }


	 angular.module('taskControllApp').factory('TaskUnderProjectCountService', TaskUnderProjectCountService);
})();