var mongojs = require('mongojs');
var validator = require('validator');
var Task = require('../../models/Task');
const counters = require('../../models/Counters');
var express = require('express');
var app = express();
var moment = require('moment');
var taskRoute = express.Router();
var User = require('../../../src/app/models/user');

//api for CRUD operation on task documents

//  http://localhost:port/api/tasks/
taskRoute.route('/')
	.post(function(req,res){
		var data = req.body;
		var errorMsg = {};

		if(Object.keys(data).length == 0){
			errorMsg.error_message = 'Task details can not be empty'	
            return res.status(500).send(errorMsg);
		}
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		var newTask = new Task();
		
		if(!data.name || validator.isEmpty(data.name)){
			_setErrorMessage('Task name' , 'Task Name can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!data.assignedTo || validator.isEmpty(data.assignedTo)){
			_setErrorMessage('Assigned to' , 'Assigned to can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!data.userId || validator.isEmpty(data.userId)){
			_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		newTask.name = data.name;
		newTask.assignedTo = data.assignedTo;
		if(data.dueDate && data.dueDate != ''){
			newTask.dueDate = moment(data.dueDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
		}
		newTask.status = 'Open';
		newTask.priority = data.priority;
		newTask.user = data.userId;
		if(data.parentTask && data.parentTask != ''){
			newTask.parentTask = data.parentTask;
		}
		const saveTaskPromise = (task) => {

				return new Promise((resolve, reject) => {
				
					return task.save(function(err) {
						if(err){
							reject(err);
						}else{
							resolve({ message: 'Task Created!' });
						}
					});

				});
		}

		
		counters.findOneAndUpdate(
				{name : 'task_id'},
	            {$inc: { seq: 1 } },
	            {new: true},
 				function (error, doc) {
		          	if(error || doc == null) {
		          	 	return res.status(500).send('Fail to fetch next task id');
		          	}else{
		          		newTask.task_id = 'T'+ doc.seq;
		          		saveTaskPromise(newTask).then((data) =>{
							console.log(data.message);
							return res.json({ message: data.message });
						}).catch((err) =>{
							console.log(err);
							return res.status(500).send(err);
						});
		          	}
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

		if(!req.query.user_id || validator.isEmpty(req.query.user_id)){
			_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		var parentTask = req.query.parentTask;
		var user = req.query.user_id;
		var assignedTo = req.query.assigned_to;
		var dueDate = req.query.due_date;
		var status = req.query.status;
		var name = req.query.name;
		var priority = req.query.priority;

		if(parentTask && parentTask != ''){
			criteria.parentTask = parentTask;
		}
		if(user && user != ''){
			criteria.user = user;
		}

		if(assignedTo && assignedTo != ''){
			criteria.assignedTo = assignedTo;
		}

		if(dueDate && dueDate != ''){
			criteria.dueDate = moment.utc(dueDate, 'YYYY-MM-DD').toDate();
		}

		if(status && status != ''){
			criteria.status = status;
		}
		
		if(name && name != ''){
			criteria.name = name;
		}

		if(priority && priority != ''){
			criteria.priority = priority;
		}

		Task.find(criteria)
		.sort(JSON.parse(req.query.sortObj))
	    .populate('user')
	    .populate('parentTask')
        .exec(function(error, tasks) {
           if (error)
	            return res.send(error);

	        return res.json(tasks);
        });

	});

//http://localhost:8080/api/tasks/:task_id
taskRoute.route('/:task_id')
	
	.get(function(req, res) {

		var criteria = {};
		var errorMsg = {};

		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.query.user_id || validator.isEmpty(req.query.user_id)){
			_setErrorMessage('User Id' , 'User Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!req.params.task_id || validator.isEmpty(req.params.task_id)){
			_setErrorMessage('Task Id' , 'Task Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		criteria._id = req.params.task_id;
		criteria.user = req.query.user_id;


		Task
		.find(criteria)
		.populate('user')
		.populate('parentTask')
		.exec(function(error,task){
			if(error)
				return res.send(error);
			return res.json(task);
		});
    })
    .put(function(req, res) {

    	var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		/*if(!req.query.user_id || validator.isEmpty(req.query.user_id)){
			_setErrorMessage('User Id' , 'User Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}*/

		if(!req.params.task_id || validator.isEmpty(req.params.task_id)){
			_setErrorMessage('Task Id' , 'Task Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

        Task.findById(req.params.task_id, function(err, task) {

            if (err)
                return res.send(err);

            task.name = req.body.name;
            task.status = req.body.status;
			task.assignedTo =  req.body.assignedTo;
			task.parentTask = req.body.parentTask.id;
			task.shared = true;
			var sharedUsers = req.body.sharedUsers || [];
			sharedUsers.push(req.body.sharedWith)
			task.sharedUsers = sharedUsers;
			task.task_id = req.body.task_id;
			
			//rewrite with promise
			const getSharedTask = (data) => {
				const newTask = new Task();
				newTask.user = data.user._id;
	            newTask.parentTask = req.body.parentProjectId;
	            newTask.name = task.name;
	            newTask.status = task.status;
	            newTask.assignedTo = task.assignedTo;
	            newTask.sharedByOtherUser = "Yes";
	            newTask.task_id = 'T' + data.seq;
	            return newTask;
			}
			const generateNextTaskId = (user) => {
				return new Promise((resolve, reject) => {
					counters.findOneAndUpdate(
					{name : 'task_id'},
		            {$inc: { seq: 1 } },
		            {new: true},
	 				function (error, doc) {
			          	if(error || doc == null) {
			          	 	reject(error);
			          	}else{
			          		const data = {
			          			user : user,
			          			seq  : doc.seq
			          		};
			       			resolve(data);
			          	}
		    		});
				});
			}
			const saveTaskPromise = (task) => {

				return new Promise((resolve, reject) => {
				
					return task.save(function(err) {
						if(err){
							reject(err);
						}else{
							resolve({ message: 'Task updated!' });
						}
					});

				});
			}
			if(req.body.sharedWith && req.body.sharedWith != ''){

				User.getUserByUsername(req.body.sharedWith).then((user) =>{
					if(!user){
						_setErrorMessage('User' , 'Invalid User specified', 'Invalid Value');
						throw errorMsg;
					}
					return generateNextTaskId(user);
				}).then((data) =>{
					return saveTaskPromise(getSharedTask(data));
				}).then((res) =>{
					console.log(res.message);
		            return saveTaskPromise(task);
				}).then((data) =>{
					console.log(data.message);
					return res.json({ message: 'Task updated and shared!' });
				}).catch((err) =>{
					console.log(err);
					return res.status(500).send(errorMsg);
				});
			}else {
				saveTaskPromise(task).then((data) =>{
					console.log(data.message);
					return res.json({ message: 'Task updated!' });
				}).catch((err) =>{
					console.log(err);
					return res.status(500).send(errorMsg);
				});
			}

        });
    })
    .delete(function(req, res) {
        
    	var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.query.user_id || validator.isEmpty(req.query.user_id)){
			_setErrorMessage('User Id' , 'User Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!req.params.task_id || validator.isEmpty(req.params.task_id)){
			_setErrorMessage('Task Id' , 'Task Id can not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

        Task.remove({
            _id: req.params.task_id,
            user: req.query.user_id
        }, function(err, task) {
            if (err)
                return res.send(err);

            return res.json({ message: 'Task deleted' });
        });
    });

    taskRoute.route('/multer').post(function(req,res){
    	upload.single('file');
    });

module.exports = taskRoute;	