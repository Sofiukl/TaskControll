const User = require('../../../src/app/models/user');

module.exports = function(io) {

	'use strict';
	var connections = [];
	var users = [];
	io.sockets.on('connection', function(socket){
		connections.push(socket.id);
		console.log('Connected: ' + connections.length + ' socket connected..');

		socket.on('new user', function(user){
			socket.username = user.name;
			user.socketId = socket.id;
			users.push(user);
		});


		socket.on('message', function(from, message){
			console.log('Received message from ' + from +': '+ message);
			socket.emit('broadcast', {
				payload: message,
				source: from
			})
			console.log('broadcast complete..')
		})

		socket.on('task save', function(from, message){
			console.log('Received msg in server: ' + from +': '+ message);
			io.sockets.emit('broadcast', {
				payload: message,
				source: from
			})
			console.log('complete..')
		});

		socket.on('task share', function(userInfo, message){
			console.log('Received msg in server: ' + userInfo.userId +': '+ message);
			const sourceUserId = userInfo.userId;
			//find target socket Id from another user information
			const sharedWithSocketId = users[0].socketId;

			io.sockets.to(sharedWithSocketId).emit('broadcast', {
				payload: message,
				source: userInfo.name
			})
			console.log('Task Share event complete..')
		});

		//trying to write one generic event listener
		//where the following information is available -
		//event creater, event listeners, event information object

		socket.on('share', function(eventCreator, eventListeners, event){
			console.log('Received following event in server from : ' + eventCreator.name);
			console.log('Event: ' + JSON.stringify(event));
			console.log('This event will be sent to the following user: ');
			eventListeners.forEach((l) =>{
				console.log('test ~ sharedWith: ' + l.name);
				/*User.getUserByUsername(l.name).then((user) =>{
					l.id = user._id;
					console.log('called...'+ l.name);
					console.log('user: ' + JSON.stringify(user));

				}).catch((error) =>{
					throw 'Can not find target user id';
				});	*/	
			})
			
			const sourceId = eventCreator.id;
			//find target socket Id from another user information
			console.log('length(users): ' + JSON.stringify(users));
			console.log('length(eventListeners): ' + JSON.stringify(eventListeners));

			var desSocketIds = [];
			eventListeners.forEach((l) => {
				users.forEach((u) => {
					if(l.name == u.name){
						console.log('l.name ~ ' + l.name);
						console.log('u.name ~ ' + u.name);
						desSocketIds.push(u.socketId);
						return;
					}
				})
			})
			console.log('length(desSocketIds) ~ ' + desSocketIds.length);
			desSocketIds.forEach((id) =>{
				io.sockets.to(id).emit('broadcast', {
					payload: event.message,
					source: eventCreator.name
				})
			})
			
			console.log('Task Share event complete..')
		});


	})

}