var EventEmitter = require('./event.emitter.js');

var emtr = new EventEmitter();
emtr.sayHello = 'Hello from EventEmitter..'
module.exports = emtr;