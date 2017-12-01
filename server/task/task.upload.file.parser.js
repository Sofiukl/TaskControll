var validator = require('validator');
var Task = require('../models/Task');
var moment = require('moment');
var TaskCreatorManager = require('./task.creator.manager');
var fs = require('fs');

var TaskJsonParser = {
	
	parseFile : function parseFile(req, res, tasksRawData) {
		
		  const taskCount = TaskCreatorManager.manageTaskCreation(tasksRawData, req, res);
		  console.log(taskCount + ' tasks created..');
	}
}

module.exports = TaskJsonParser;	