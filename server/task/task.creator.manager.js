var TaskPopulator = require('./task.populator.js');
var TaskValidator = require('./task.validator.js');
var TaskCreator = require('./task.creator.js');

var TaskCreatorManager = {

	manageTaskCreation : function manageTaskCreation (tasksRawData, req, res) {

		console.log('res ' + res);
		var taskCount = 0;
		if(tasksRawData && tasksRawData.length == 0) {
			consol.log('Empty task list..');
			return ;
		}
		var obj = JSON.parse(tasksRawData);

		obj.forEach(function(item){
			console.log('Inside loop populate task');
    		var newTask = TaskPopulator.populateTask(item);
			var validationMsgs = TaskValidator.validateTask(newTask);
			console.log('validationMsgs: ' + JSON.stringify(validationMsgs));
			if(validationMsgs.error_field){
				console.log('Task validation failed');
				return res.status(500).send(validationMsgs);
			}
			TaskCreator.createSingleTask(newTask, req, res);
			taskCount = taskCount + 1;
		});
		console.log('taskCount: ' + taskCount);
		return taskCount;
	}
}

module.exports = TaskCreatorManager;