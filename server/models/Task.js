var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Task Schema
var TaskSchema = new Schema({

	task_id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	assignedTo: {
		type: String,
		required: true
	},

	dueDate:{
		type:Date
	},

	status:{
		type:String,
		required: true
	},

	priority:{
		type:Number,
	},

	parentTask:{
		type : Schema.Types.ObjectId, 
		ref: 'Project'
	},

	user:{
		type: Schema.Types.ObjectId,
		ref:'User',
		required:true
	},

	shared : Boolean,

	sharedUsers : [{
		type: String
	}],

	sharedByOtherUser : String,

	created:{
		type: Date, 
		default:Date.now
	},

	updated:{
		type: Date, 
		default:Date.now
	}
	
}, {collection : 'tasks'});

module.exports = mongoose.model('Task', TaskSchema);