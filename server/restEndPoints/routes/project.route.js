var mongojs = require('mongojs');
var validator = require('validator');
var Project = require('../../models/Project');
var express = require('express');
var moment = require('moment');
var taskRoute = express.Router();
var ensureAuthentication = require('./routes.restriction.js');

taskRoute.route('/')
	//.all(ensureAuthentication)
	.post(function(req,res){
		
		var data = req.body;

		var errorMsg = {};

		if(Object.keys(data).length == 0){
			errorMsg.error_message = 'Project details can not be empty'	
            return res.status(500).send(errorMsg);
		}
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}
		
		if(!data.name || validator.isEmpty(data.name)){
			_setErrorMessage('Project name' , 'Project Name can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!data.userId ||  validator.isEmpty(data.userId)){
			_setErrorMessage('User Id' , 'User Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		var newProject = new Project();
		newProject.name = data.name;
		newProject.description = data.description;
		newProject.status = 'Open';
		newProject.user = data.userId;

		newProject.save(function(err) {
	        if (err){
	            return res.status(500).send(err);
	        }
	        return res.json({ message: 'Project created!'});
		});	

	})
	.get(function(req,res){
		var criteria = {};

		var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}
		//This criteria added is only for fecthing default project
		if(!req.query.user_id || validator.isEmpty(req.query.user_id)){
			if(!req.query.name || req.query.name !== 'Default'){
				_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
				return res.status(500).send(errorMsg);
			}
			
		}

		if(req.query.user_id && req.query.user_id != ''){
			criteria.user = req.query.user_id;		
		}

		if(req.query.status && req.query.status != ''){
			criteria.status = req.query.status;
		}
		
		if(req.query.name && req.query.name != ''){
			criteria.name = req.query.name;
		}

		Project.find(criteria)
	    .populate('user')
        .exec(function(error, projects) {
           if (error)
	            return res.send(error);

	        return res.json(projects);
        });

	});

//http://localhost:8080/api/projects/:project_id
taskRoute.route('/:project_id')
	
	.get(function(req, res) {

		var criteria = {};

		var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.query.user_id || validator.isEmpty(req.query.user_id)){
			_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!req.params.project_id || validator.isEmpty(req.params.project_id)){
			_setErrorMessage('Project Id' , 'Project Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(req.query.user_id && req.query.user_id != ''){
			criteria.user = req.query.user_id;		
		}

		Project
		.find({_id : req.params.project_id, user : req.query.user_id})
		.populate('user')
		.exec(function(error,project){
			if(error)
				return res.send(error);
			return res.json(project);
		});
    })
    .put(function(req, res) {

    	var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.params.project_id || validator.isEmpty(req.params.project_id)){
			_setErrorMessage('Project Id' , 'Project Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

        Project.findById(req.params.project_id, function(err, project) {

            if (err)
                return res.status(500).send({error_message : err.message});

            if(req.body && req.body.name){
            	project.name = req.body.name;
            }
            if(req.body && req.body.description){
            	project.description = req.body.description;
            	console.log('Description: ' + project.description);
            }
            if(req.body && req.body.startDate){
            	project.startDate = req.body.startDate;
            	console.log('Start Date: ' + project.startDate);
            }
            if(req.body && req.body.completionDate){
            	project.completionDate = req.body.completionDate;
            	console.log('Completion Date: ' + project.completionDate);
            }
            // save the project
            project.save(function(err) {
                if (err)
                    return res.send(err);

                return res.json({ message: 'Project updated!' });
            });

        });
    })
    .delete(function(req, res) {
        var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.params.project_id || validator.isEmpty(req.params.project_id)){
			_setErrorMessage('Project Id' , 'Project Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

        Project.remove({
            _id: req.params.project_id
        }, function(err, project) {
            if (err)
                return res.send(err);

            return res.json({ message: 'Project deleted' });
        });
    });



module.exports = taskRoute;
