
var events = require('events');
console.log(events);
var eventEmitter = function(){};

eventEmitter = Object.create(events.EventEmitter);
events.EventEmitter.call(eventEmitter);


console.log(eventEmitter.prototype);

eventEmitter.on('new_event', function(){
	console.log('new event brodcasted..');
})

eventEmitter.on('new_event', function(message,greet){
	console.log(greet + ' ' + message);
})


eventEmitter.emit('new_event', 'from test.arbitary.js', 'welcome');

module.exports = eventEmitter;

