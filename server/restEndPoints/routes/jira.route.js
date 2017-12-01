var mongojs = require('mongojs');
var validator = require('validator');
var Task = require('../../models/Task');
var express = require('express');
var app = express();
var moment = require('moment');
var config = require('../../common/config/jira.config.js');
var JiraApi = require('jira').JiraApi;
var jira = new JiraApi('http', config.host, config.port, config.user, config.password, config.version);
var jiraRoute = express.Router();

//api for CRUD operation on task documents

//  http://localhost:port/api/jiratasks/
jiraRoute.route('/')
	.post(function(req,res){
		
    	
	})
	.get(function(req,res){

		var criteria = {};
		var errorMsg = {};

		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.query.userId || validator.isEmpty(req.query.userId)){
			_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		var jql = req.query.jql;
		var user = req.query.userId;


		if(jql && jql != ''){
			criteria.jql = jql;
		}
		if(user && user != ''){
			criteria.user = user;
		}
		console.log('jql: ' + criteria.jql);
		
		jira.searchJira(criteria.jql, {}, function(error, tasks){
			if(error){
		    	 return res.send(error);
		    }
			console.log('Result of search string: ' + jql);
		    tasks.issues.forEach(function(task){
		    	console.log(task.key);
		    	console.log(task.fields.summary);
		    	console.log(task.fields.status.name);
		    })
		    return res.json(tasks.issues);
		});
	});

//http://localhost:8080/api/tasks/:jira_id
jiraRoute.route('/:jira_id')
	
	.get(function(req, res) {
	
    })
    .put(function(req, res) {
    	var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.params.jira_id || validator.isEmpty(req.params.jira_id)){
			_setErrorMessage('Task Id' , 'Task Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}
		var issueUpdate = {

			"update" : {
				"fields" : {
					"status" : {
						"name" : ''
					}
				}
			}
		}
		issueUpdate.update.fields.status.name = req.body.fields.status.name;

		jira.updateIssue(req.body.jira_id, issueUpdate, function(error, tasks){
			if(error){
				throw error;
		    	 return res.send(error);
		    }
			return res.json({ message: 'JIRA Task updated!' });
		});
    	
    })
    .delete(function(req, res) {
        
    });

module.exports = jiraRoute;	