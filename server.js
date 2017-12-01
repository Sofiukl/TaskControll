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
server.listen(properties.serverPort, function(){
	console.log('Server running at ' + properties.serverPort + ' port..');	
});

//create mongoose connection
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/taskControllApp');
mongoose.connect('mongodb://taskcontroll:taskcontroll@ds125126.mlab.com:25126/taskcontroll');


//modularization of routing in express 4
var facebookRoute = require('./server/oAuth/facebook/oAuthFbRoute.js');
var loginRoute = require('./server/login/loginRoute.js');
var ensureAuthentication = require('./server/restEndpoints/routes/routes.restriction.js');


app.use('/', ensureAuthentication);
app.use('/', facebookRoute);
app.use('/', loginRoute);
app.use('/api/tasks', require('./server/restEndPoints/routes/task.route.js'));
app.use('/api/task', require('./server/restEndPoints/routes/task.file.upload.js'));
app.use('/api/projects', require('./server/restEndPoints/routes/project.route.js'));
app.use('/api/feeds', require('./server/restEndPoints/routes/feed.route.js'));
app.use('/api/jiratasks', require('./server/restEndPoints/routes/jira.route.js'));
app.use('/api/task/upload', require('./server/restEndPoints/routes/route.task.bulk.entry.js'));




//////////////////////////////////////////////////////////////////
/**
The below portion is for testing 
not related to actual project
**/




/*console.log(`Current directory: ${process.cwd()}`);
console.log('Your arguments: ');
process.argv.forEach(function(val, index){
	console.log(val);
});*/

/*
setTimeout(function(){
	console.log('I am trying to learn');
}, 2000)*/


//var emtr = require('./server/test.node.features/event.exposer');

//var receiver1 = require('./server/test.node.features/event.receiver');
//var receiver2 = require('./server/test.node.features/event.receiver1');


//emtr.emit('event1','first-event');

//var file = require('./server/test.node.features/test.file.operation');

//connect to jira
/*var config = require('./server/common/config/jira.config.js');

JiraApi = require('jira').JiraApi;
const issueNumber = 'THAGMO-3888';

var jira = new JiraApi('http', config.host, config.port, config.user, config.password, config.version);
jira.findIssue(issueNumber, function(error, issue) {
    if(error){
    	console.log(error);
    }
    console.log('Status: ' + issue.fields.status.name);
});



jira.getUsersIssues('shalinis', true, function(error, result) {
    if(error){
    	console.log(error);
    }
    
    result.issues.forEach(function(issue){
    	console.log(issue.key);
    })
});

const jql = 'project = THAGMO AND status in (Open, "In Progress", Reopened, "Ready for Review") AND assignee in (shalinis, somasekhara) ORDER BY updatedDate DESC'
jira.searchJira(jql, {}, function(error, data){
	if(error){
    	throw error;
    }
	console.log('Result of search string: ' + jql);
    data.issues.forEach(function(issue){
    	console.log(issue.key);
    	console.log(issue.fields.summary);
    	console.log(issue.fields.status.name);
    })
});*/


//test for task bulk upload
//var TaskJsonParser = require('./server/task/task.upload.file.parser.js');
//var tasksCount = TaskJsonParser.parseFile()
//console.log('task count: ' + tasksCount);