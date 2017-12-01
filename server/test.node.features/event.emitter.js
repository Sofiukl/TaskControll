var util = require('util');
var EventEmitter = require('events');


function Greeter(){
	EventEmitter.call(this);
}

util.inherits(Greeter, EventEmitter);




/*function EventEmitter() {
	this.events = {};
}

EventEmitter.prototype.on = function(type, listener){
	this.events[type] = this.events[type] || [];

	if(!util.isFunction(listener)){
		throw new TypeError('Listener should be a function..');
	}
	this.events[type].push(listener);
}

EventEmitter.prototype.emit = function(type){

	var argumentArray = Array.prototype.slice.call(arguments);

	var argSubArray = argumentArray.slice(1,argumentArray.length);
	
	this.events[type].forEach(function(listener){
		listener.apply(null,argSubArray);
	});
}*/

module.exports = Greeter;