(function () {
	 'use strict';

	 function MessageFormatterService (nick, message) {
	 	return ' - ' + 
           nick + ' - ' + 
           message + '\n';
	 }

	 angular.module('taskControllApp').factory('MessageFormatterService', MessageFormatterService);
})();