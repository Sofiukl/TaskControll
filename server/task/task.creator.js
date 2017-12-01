var Task = require('../models/Task');
var moment = require('moment');
const counters = require('../models/Counters');

var TaskCreator = {
	
	createSingleTask : function createSingleTask(newTask, req, res) {
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
							//return res.json({ message: data.message });
						}).catch((err) =>{
							console.log(err);
							return res.status(500).send(err);
						});
		          	}
	    });
	}
}

module.exports = TaskCreator;