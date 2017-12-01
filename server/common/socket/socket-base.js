module.exports = (io) => {
	'use strict';

	//Array storing all connections
	var connections = [];
	//Array for storing users
	var users = [];
	//Array for storing messages
	var messages = [];
	//channels
	var channels = [];


	//socket connection event for all sockets
	io.sockets.on('connection', function(socket){
	    connections.push(socket.id);
	    console.log('Connected: ' + connections.length + ' socket connected..');

	    //this app listeners
	    socket.on('task share', function(message){
	        //event for showing messages for all the connected sockets
	        io.sockets.emit('broadcast',{message : message, username:socket.username});
	    });
















	    //load all the online users and communication between them
	    socket.emit('initial setup',{users : users,messages : messages});
	    //event for adding new message
	    socket.on('new message', function(message){
	        messages.push({message : message, username:socket.username});
	        //event for showing messages for all the connected sockets
	        io.sockets.emit('show message',{message : message, username:socket.username});
	        //event for reseting input areas only for this user
	        socket.emit('reset message input');
	    });
	    //event for adding new user
	    socket.on('new user', function(username){
	        socket.username = username;

	        var userObj = {};
	        userObj.username = username;
	        userObj.userId = socket.id;

	        users.push(userObj);
	        //extra event for this room 'first-2'
	        //io.sockets.to('first-2').emit('event-for-first-2');
	        if(connections.length >=3){
	            io.sockets.to(connections[2]).emit('only for you');
	        }
	        //event for showing the new user for all sockets
	        io.sockets.emit('show user',users);
	        //event for enabling chat area only for this new user
	        socket.emit('enable chat area');
	    });
	    
	    //private chat

	    socket.on('new chat request', function(data){
	        console.log('listening new chat request event..')
	        
	        var currentUser = null;
	        var anotherUser = null;

	        for(var i=0; i<users.length; i++){
	            if(users[i].userId == socket.id){
	                currentUser = users[i];
	            }
	            if(users[i].username === data){
	                anotherUser = users[i];     
	            }
	        }

	        var channel = {};
	        channel.name = 'channel' + Math.random();
	        channel.participants = [];
	        channel.participants.push(currentUser.userId);
	        channel.participants.push(anotherUser.userId);
	        channels.push(channel);
	        for(var i=0; i<channel.participants.length; i++){
	            io.sockets.to(channel.participants[i]).emit('enable private chat', channel.name);
	        }
	    });

	    socket.on('new private message', function(message,channelName){
	        console.log('new private message: ' + channelName)
	        for(var i=0; i<channels.length; i++){
	            if(channels[i].name == channelName){
	                for(var j=0; j<channels[i].participants.length; j++){
	                    console.log('channels[i].participants[j]: ' + channels[i].participants[j]);
	                    io.sockets.to(channels[i].participants[j]).emit('show private message',{message : message, username:socket.username,channel:channelName});
	                }       
	            }
	        }
	        
	    });

	    //Disconnect
	    socket.on('disconnect', function(){
	        connections.splice(connections.indexOf(socket.id),1);
	        users.splice(users.indexOf(socket.username),1);
	        console.log('Connected: ' + connections.length + ' socket connected..');
	    });
	});
}