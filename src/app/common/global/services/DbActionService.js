(function() {

	'use strict';

	function DbActionService($http, $log, toastr, moment) {
		 
		var serviceHandler = {};

		serviceHandler = {
			baseUrl : 'http://localhost:8081',
			taskEndPoint : '/api/tasks',
			projectsEndPoint : '/api/projects'
		}

		serviceHandler.updateTask = function(taskId, data){
			var url = serviceHandler.taskEndPoint + '/' + taskId;
			return $http.put(url, data);
		}
		serviceHandler.deleteTask = function(taskId, userId){
			var url = serviceHandler.taskEndPoint + '/' + taskId;
			return $http.delete(url, {
				params : {user_id : userId}
			});
		}
		serviceHandler.getTask = function(taskId, userId){
			var url = serviceHandler.taskEndPoint + '/' + taskId;
			return $http.get(url, {
				params : {user_id : userId}
			});
		}
		serviceHandler.getAllTasks = function(reqData, sortObj){
			var url = serviceHandler.taskEndPoint;
			var criteria = {};
			
			if(reqData.parentTask && reqData.parentTask != ''){
				criteria.parentTask = reqData.parentTask;
			}

			if(reqData.userId && reqData.userId != ''){
				criteria.user_id = reqData.userId;
			}
			
			if(reqData.assignedTo && reqData.assignedTo != ''){
				criteria.assigned_to = reqData.assignedTo;
			}
			if(reqData.dueDate && reqData.dueDate != ''){
				criteria.due_date = moment(reqData.dueDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
			}	

			if(reqData.status && reqData.status != ''){
				criteria.status = reqData.status;
			}

			if(reqData.name && reqData.name != ''){
				criteria.name = reqData.name;
			}

			if(reqData.priority && reqData.priority != 0){
				criteria.priority = reqData.priority;
			}
			criteria.sortObj = sortObj;
			
			return $http.get(url, {
				params : criteria
			});
		}

		serviceHandler.saveTask = function(data){
			return $http.post(serviceHandler.taskEndPoint, data);
		}

		serviceHandler.getProject = function(projectId, userId){
			var url = serviceHandler.projectsEndPoint + '/' + projectId;
			return $http.get(url, {
				params : {user_id : userId}
			});
		}

		
		serviceHandler.getAllProjects = function(criteria){
			var url = serviceHandler.projectsEndPoint;
			return $http.get(url, {
				params : criteria
			});
		}

		serviceHandler.saveProject = function(data){
			return $http.post(serviceHandler.projectsEndPoint, data);
		}

		serviceHandler.updateProject = function(projectId, data){
			var url = serviceHandler.projectsEndPoint + '/' + projectId;
			return $http.put(url, data);
		}

		serviceHandler.deleteProject = function(projectId, userId){
			var url = serviceHandler.projectsEndPoint + '/' + projectId;
			return $http.delete(url, {
				params : {user_id : userId}
			});
		}

		return serviceHandler;
	}

	angular.module('taskControllApp').factory('DbActionService', DbActionService);


})();