var emtr = require('./event.exposer');

console.log(emtr.sayHello);

emtr.on('event1', function(arg1){
	console.log('Notified on occurance of event ' + arg1);
});

emtr.on('event1', function(arg1){
	console.log('called listener on occurance of event event1');
});