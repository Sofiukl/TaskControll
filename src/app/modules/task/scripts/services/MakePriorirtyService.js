(function () {
	 'use strict';

	 function MakePriorityService ($log) {
	 	 
	 	 var serviceObj = {};

	 	 serviceObj.encodePriority = encodePriority;
	 	 serviceObj.decodePriority = decodePriority;

	 	 function encodePriority(priorityObj) {
	 	 	if(!angular.isObject(priorityObj)){
	 	 		return 'task priority can not be empty';
	 	 	}
	 	 	var keys = ['firstStar','secondStar', 'thirdStar'];
	 	 	var priority = 0;
	 	 	for(var i=0; i<3; i++){
	 	 		$log.debug('priorityObj[keys[i]] : ' + priorityObj[keys[i]]);
	 	 		if(priorityObj[keys[i]] !== 'none'){
	 	 			priority = priority + 1;
	 	 		}
	 	 	}
	 	 	return priority;
	 	 }

	 	 function decodePriority(priorityValue) {
	 	 	var keys = ['firstStar','secondStar', 'thirdStar'];
	 	 	var cssClasses = ['yellow-star-1', 'yellow-star-2', 'yellow-star-3'];
	 	 	var priorityObj = {};

	 	 	for(var i=0; i<priorityValue; i++){
	 	 		priorityObj[keys[i]] = cssClasses[i]
	 	 	}

	 	 	return priorityObj;
	 	 }
	 	 
	 	 return serviceObj; 
	 }


	 angular.module('taskControllApp').factory('MakePriorityService', MakePriorityService);
})();