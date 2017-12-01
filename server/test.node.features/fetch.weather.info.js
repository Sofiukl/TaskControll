'use strict';

var http = require('http');
var qs = require('querystring');
var util = require('util');

module.exports = function(){

	var queryParam = {
		id : '1275004',
		APPID : 'f893794ec603b47f9f1b717b4066cfbd',
		mode : 'xml'
	}

	var url = 'http://api.openweathermap.org/data/2.5/weather' + '?' + qs.stringify(queryParam);

	http.get(url, function(res){

		var body = '';

		res.on('data', (chunk) => {
			body +=chunk;
		});

		res.on('end', () => {
			console.log('weather json: ' + body);
		});

	})
}

