var emtr = require('./event.exposer');

console.log(emtr.sayHello);

emtr.on('event1', function(arg1){
	console.log('called listener from event.receiver.js');
});