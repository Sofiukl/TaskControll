var fs = require('fs');

console.log(__dirname);

fs.readFile(__dirname + '/config.txt', 'utf8', function(err, data){
	console.log('file reading completed..');
	console.log(data);
});


//need to understand buffer, stream during large data fetching
