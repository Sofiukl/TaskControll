//import dependencies
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var querystring = require('querystring');
var http = require('http');
var favicon = require('serve-favicon');

//app initialization
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var socketbase = require('./server/common/config/socket-base')(io);
var router = express.Router();
var properties = require('./server/common/config/application-properties.js');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());
app.use(express.static(__dirname + '/src/app'));
app.use(morgan('dev'));
app.use(favicon(path.join(__dirname,'src','app','assets','images','favicon.ico')));

var sessionOpts = {
  cookie : { httpOnly: true, maxAge: 2419200000 },
  saveUninitialized: true, 
  resave: false, 
  secret: '12345',
}
app.use(session(sessionOpts));



//start the server
var port = process.env.PORT || 3000;
app.set('port', port);
server.listen(port, function(){
	console.log('Server running at ' + properties.serverPort + ' port..');	
});

//create mongoose connection
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/taskControllApp');
mongoose.connect('mongodb://taskcontroll:taskcontroll@ds125126.mlab.com:25126/taskcontroll', { useMongoClient: true });


//modularization of routing in express 4
var facebookRoute = require('./server/oAuth/facebook/oAuthFbRoute.js');
var loginRoute = require('./server/login/loginRoute.js');
var ensureAuthentication = require('./server/restEndPoints/routes/routes.restriction.js');


app.use('/', ensureAuthentication);
app.use('/', facebookRoute);
app.use('/', loginRoute);
app.use('/api/tasks', require('./server/restEndPoints/routes/task.route.js'));
app.use('/api/task', require('./server/restEndPoints/routes/task.file.upload.js'));
app.use('/api/projects', require('./server/restEndPoints/routes/project.route.js'));
app.use('/api/feeds', require('./server/restEndPoints/routes/feed.route.js'));
app.use('/api/jiratasks', require('./server/restEndPoints/routes/jira.route.js'));
app.use('/api/task/upload', require('./server/restEndPoints/routes/route.task.bulk.entry.js'));