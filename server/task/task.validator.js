var validator = require('validator');

var TaskValidator = {

	validateTask : function validateTask(data) {

		console.log('data: ' + JSON.stringify(data));
		var errorMsg = {};

		if(Object.keys(data).length == 0){
			errorMsg.error_message = 'Task details can not be empty'	
            return errorMsg;
		}
		
		function _setErrorMessage(field, msg, type) {
			errorMsg.error_field = field;
			errorMsg.error_message = msg;
			errorMsg.error_type = type;
		}
		
		if(!data.name || validator.isEmpty(data.name)){
			_setErrorMessage('Task name' , 'Task Name can not be empty', 'Invalid Value');
			return errorMsg;
		}

		if(!data.assignedTo || validator.isEmpty(data.assignedTo)){
			_setErrorMessage('Assigned to' , 'Assigned to can not be empty', 'Invalid Value');
			return errorMsg;
		}

		if(!data.userId || validator.isEmpty(data.userId)){
			_setErrorMessage('User Id' , 'User Id not be empty', 'Invalid Value');
			return errorMsg;
		}

		return errorMsg;
	}
}

module.exports = TaskValidator;	