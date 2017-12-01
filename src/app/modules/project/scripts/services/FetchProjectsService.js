 (function () {
	 'use strict';

	 function FetchProjectsService(DbActionService, toastr, $log, $q) {

	 	var projectFetcher = {};
	 	
	 	projectFetcher.getAllProjects = getAllProjects;

	 	function getAllProjects(userInfo) {

	 	var defer = $q.defer();
	 	var projects = [];

	 	var defaultCriteria = {};
        defaultCriteria.status = 'Open';
        defaultCriteria.name = 'Default';

        DbActionService.getAllProjects({user_id : userInfo.userId, status : 'Open'})
                .then(function(response){
                    angular.forEach(response.data, function(project,index){
                        if(project.name && project._id){
                           projects.push({name : project.name, id: project._id});
                        }
                    });

                    DbActionService.getAllProjects(defaultCriteria)
                    .then(function(r){
                        if(r.data.length != 0){
                            projects.push({name : r.data[0].name, id: r.data[0]._id});
                        }
                        defer.resolve(projects);
                    }, function(r){
                        defer.reject(r);
                    });  

                }, function(response){
                    defer.reject(response);
        		});

        return defer.promise;

	 	}

	 	 return projectFetcher;

	 }

	 angular.module('taskControllApp').factory('FetchProjectsService', FetchProjectsService);
	 
})();