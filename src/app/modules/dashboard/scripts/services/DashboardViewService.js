(function () {
	 'use strict';

	 function DashboardViewService ($log) {
	 	 
	 	 var serviceObj = {};

	 	 serviceObj.viewTypes = ['list','thumbnail'];
	 	 serviceObj.viewClassTypes = ['fa-bg-list', 'fa-bg-thumbnail'];
	 	 serviceObj.selectedIndex = 1;
	 	 serviceObj.activeView = serviceObj.viewTypes[serviceObj.selectedIndex];
	 	 serviceObj.activeViewClass = serviceObj.viewClassTypes[serviceObj.selectedIndex];
	 	 serviceObj.changeViewType = changeViewType;

	 	 function changeViewType(index) {
	 	 	serviceObj.activeView = serviceObj.viewTypes[index];
	 	 	serviceObj.activeViewClass = serviceObj.viewClassTypes[index];
	 	 }
	 	 
	 	 return {
	 	 	changeViewType : serviceObj.changeViewType,
	 	 	getActiveView : function() {
	 	 		return serviceObj.activeView;
	 	 	},
	 	 	getActiveViewClass : function() {
	 	 		return serviceObj.activeViewClass;
	 	 	}
	 	 };
	 }


	 angular.module('taskControllApp').factory('DashboardViewService', DashboardViewService);
})();