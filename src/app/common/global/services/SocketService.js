(function () {
	 'use strict';

	 function SocketService (socketFactory) {
	 	var socket = socketFactory();
      	socket.forward('broadcast');
      	return socket;
	 }

	 angular.module('taskControllApp').factory('socket', SocketService);
})();