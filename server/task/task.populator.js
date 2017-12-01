var Task = require('../models/Task');
var moment = require('moment');
const counters = require('../models/Counters');

var TaskPopulator = {

	populateTask : function populateTask(data) {

		console.log('data: ' + JSON.stringify(data));

		var newTask = new Task();
		newTask.name = data.name;
		newTask.assignedTo = data.assignedTo;
		if(data.dueDate && data.dueDate != ''){
			newTask.dueDate = moment(data.dueDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
		}
		newTask.status = data.status || 'Open';
		newTask.priority = data.priority;
		newTask.user = data.userId;
		newTask.userId = data.userId;
		if(data.parentTask && data.parentTask != ''){
			newTask.parentTask = data.parentTask;
		}

		return newTask;
	}
}

module.exports = TaskPopulator;	