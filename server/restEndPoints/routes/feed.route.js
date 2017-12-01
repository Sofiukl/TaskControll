var mongojs = require('mongojs');
var validator = require('validator');
var TaskFeed = require('../../models/TaskFeed');
var counters = require('../../models/Counters');
var express = require('express');
var moment = require('moment');
var feedRoute = express.Router();

feedRoute.route('/')
  .get(function(req, res){
  		
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

		if(req.query.user_id && req.query.user_id != ''){
			criteria.user = req.query.user_id;
		}
		
		if(req.query.status && req.query.status != ''){
			criteria.status = req.query.status;
		}

		if(req.query.name && req.query.name != ''){
			criteria.name = req.query.name;
		}

		TaskFeed.find(criteria)
	    .populate('user')
        .exec(function(error, tasks) {
           if (error)
	            return res.send(error);

	        return res.json(tasks);
        });

  })
  .post(function(req,res){
			var data = req.body;

			var errorMsg = {};

			if(Object.keys(data).length == 0){
				errorMsg.message = 'Feed details can not be empty'	
            	return res.status(500).send(errorMsg);
			}

			var name = data.name;
			var description = data.description;
			var status = data.status;
			var feed_criteria = data.feed_criteria;
			var userId = data.userId;


			if(!name || name == ''){
				errorMsg.error_message = 'Feed name can not be empty';
				errorMsg.error_field = 'Feed Name';
				errorMsg.error_type = 'Invalid Value';
				console.log('Name is empty..');
				return res.status(500).send(errorMsg);
			}
			if(!description || description == ''){
				errorMsg.error_message = 'Feed description can not be empty';
				errorMsg.error_field = 'Feed description';
				errorMsg.error_type = 'Invalid Value';

				return res.status(500).send(errorMsg);
			}
			if(!status || status == ''){
				errorMsg.error_message = 'Feed status can not be empty';
				errorMsg.error_field = 'Feed status';
				errorMsg.error_type = 'Invalid Value';

				return res.status(500).send(errorMsg);
			}

			if(!feed_criteria || Object.keys(feed_criteria).length == 0){
				errorMsg.error_message = 'Feed criteria can not be empty';
				errorMsg.error_field = 'Feed criteria';
				errorMsg.error_type = 'Invalid Value';
				return res.status(500).send(errorMsg);
			}
			if(!userId || userId == ''){
				errorMsg.error_message = 'User for whome task feed is going to enter can not be empty';
				errorMsg.error_field = 'User';
				errorMsg.error_type = 'Invalid Value';

				return res.status(500).send(errorMsg);
			}

   			counters.findOneAndUpdate(
				{name : 'task_feed_id'},
	            {$inc: { seq: 1 } },
	            {new: true},
 				function (error, doc) {
		          	if(error || doc == null) {
		          	 	return res.status(500).send('Fail to fetch next feed id');
		          	}else{
		          		var newTaskFeed = new TaskFeed();
						newTaskFeed.feed_id = doc.seq;
						newTaskFeed.name = name;
						newTaskFeed.description = description;
						newTaskFeed.status = status;
						newTaskFeed.feed_criteria = feed_criteria;
						newTaskFeed.user = userId;
			
						newTaskFeed.save(function(err) {
					        if (err){
					            return res.status(500).send(err);
					        }
					        return res.json({ message: 'Task Feed created with feed_id ' + newTaskFeed.feed_id});
						});	
		          	}
	        });
				
	});

feedRoute.route('/:feed_id')
	.get(function(req, res){

		var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.params.feed_id || validator.isEmpty(req.params.feed_id)){
			_setErrorMessage('Feed Id' , 'Feed Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

		if(!req.query){
			if(req.params.feed_id != 1){
				_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
				return res.status(500).send(errorMsg);
			}
		}else if(!req.query.user_id){
			if(req.params.feed_id != 1){
				_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
				return res.status(500).send(errorMsg);
			}
		}

		var criteriaObj = {};
		criteriaObj.feed_id = req.params.feed_id ;
		if(req.query.user_id && req.query.user_id != ''){
			criteriaObj.user = req.query.user_id;
		}

		TaskFeed
		.find(criteriaObj)
		.populate('user')
		.exec(function(error,feed){
			if(error)
				return res.send(error);
			return res.json(feed);
		});

	})
	.delete(function(req, res) {
        var errorMsg = {};
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}

		if(!req.params.feed_id || validator.isEmpty(req.params.feed_id)){
			_setErrorMessage('Feed Id' , 'Feed Id not be empty', 'Invalid Value');
			return res.status(500).send(errorMsg);
		}

        TaskFeed.remove({
            _id: req.params.feed_id
        }, function(err, feed) {
            if (err)
                return res.send(err);

            return res.json({ message: 'Feed deleted' });
        });
    });


module.exports = feedRoute;