(function() {

	'use strict';

	function FetchFromJiraService($http, $log, $q, toastr) {
		 
		var actionHandler = {};

		actionHandler = {
			baseUrl : 'http://localhost:8081',
			jiraEndPoint : '/api/jiratasks'
		}

		actionHandler.updateTask = function(taskId, data){
			var url = actionHandler.jiraEndPoint + '/' + taskId;
			return $http.put(url, data);
		}

		actionHandler.getAllTasks = function(criteria){
			var url = actionHandler.jiraEndPoint;
			return $http.get(url, {
				params : criteria
			});
		}

		actionHandler.deleteFeed = function(FeedId, userId){
			
		}

		return actionHandler;
	}

	angular.module('taskControllApp').factory('FetchFromJiraService', FetchFromJiraService);


})();