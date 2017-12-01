 (function () {
	 'use strict';

	 function DropdownService () {

	 	 var dropdowns = {};
	 	 dropdowns.dropdown = {};

	 	 var task = {
	 	 			status : [
						{id: '', name: ''},
            			{id: 'Open', name:'Open'},
            			{id: 'In Progress', name:'In Progress'},
            			{id: 'Resolve', name:'Resolve'},
            			{id: 'Close', name:'Close'}
					]
	 	 };
	 	 var jiraTask = {
	 	 			status : [
						{id: '', name: ''},
            			{id: 'Open', name:'Open'},
            			{id:'In Progress', name:'In Progress'},
            			{id:'Close', name:'Close'}
					]
	 	 };
	 	 task.orderBy = [
							{id: 'status', name:'Status'},
        					{id:'assignedTo', name:'Assignee'},
        					{id:'dueDate', name:'Due Date'}
						];

	 	dropdowns.dropdown.task = task;
	 	dropdowns.dropdown.jiraTask = jiraTask;
	 	
	 	return dropdowns;

	 }

	 angular.module('taskControllApp').factory('DropdownService', DropdownService);
	 
})();


/*

dropdowns = {
  
  dropdown :{
    charge : {
      entry :{
        option : []
      }
    }
  }

}

*/