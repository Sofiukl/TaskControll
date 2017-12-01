(function () {
	 'use strict';

	 function TaskCountService ($log, UserService, MakePriorityService, DbActionService, $q) {
	 	 
	 	 var serviceObj = {};

	 	 serviceObj.getCountForAllTaskFeed = getCountForAllTaskFeed;

	 	 function getCountForAllTaskFeed(feedArray) {
	 	 	
	 	 	var defer = $q.defer();
	 	 	var feedArrayWithCount = [];
			var promises = [];

	 	 	function findFeedCount(feed, index) {
		 	 	var defer = $q.defer();
		 	 	defer.notify('About to count no of task assoicated with thtis feed.. ' + index);

		 	 	var feedName = feed.name;
	            var task = {};
	            task = feed.feed_criteria;
	             
	            if(feed.feed_criteria.parentTask){
	                task.parentTask = feed.feed_criteria.parentTask; 
	            }
	            if(feed.feed_criteria.dueDate == '$today'){
            		task.dueDate = moment().format('DD/MM/YYYY');
        		}
		        if(feed.feed_criteria.dueDate == '$tomorrow'){
		            var today = moment();
		            var tomorrow = today.add(1, 'days')
		            task.dueDate = moment(tomorrow).format('DD/MM/YYYY');

		        }
		        if(feed.feed_criteria.dueDate == '$nextWeek'){
		            var today = moment();
		            var nextWeek = today.add('days',7)
		            task.dueDate = moment(nextWeek).format('DD/MM/YYYY');
		        }

		 	 	var criteria = {};
		 	 	
		        criteria.userId = UserService.getLoggedInUser().id;
		        criteria.status = task.status;
		        
		        if(task.dueDate && task.dueDate != ''){
		            criteria.dueDate = task.dueDate;
		        }
		        if(task.name && task.name != ''){
		            criteria.name = task.name;
		        }
		        if(task.assignedTo && task.assignedTo != ''){
		            criteria.assignedTo = task.assignedTo;
		        }
		        if(task.parentTask && task.parentTask != ''){
		            criteria.parentTask = task.parentTask;
		        }
		        if(task.priority != 0){
		            criteria.priority = task.priority;
		        }

		        var sortObj = {'dueDate' : -1};
		      
		        DbActionService.getAllTasks(criteria, sortObj)
		            .then(function(response){
		            	feed.taskCount = response.data.length;
		                feedArrayWithCount.push(feed);
		                defer.resolve(feed);
		            }, function(response){
		                toastr.error(response.data.error_message, '[Error]');
		                defer.reject('Fail to found task count.');
		            });  

		         return defer.promise;
		
		 	 }

		 	 function lastTask(feed) {
		 	 	defer.resolve(feedArrayWithCount);
		 	 }

	 	 	angular.forEach(feedArray, function(feed, index){
	 	 		promises.push(findFeedCount(feed, index));
	 	 	});
		 	 
		 	$q.all(promises).then(lastTask);

		 	return defer.promise;
		}
	 	 
	 	 return serviceObj; 
	 }


	 angular.module('taskControllApp').factory('TaskCountService', TaskCountService);
})();