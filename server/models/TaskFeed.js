	var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Project Schema
var TaskFeedSchema = new Schema({
	
	feed_id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	status:{
		type:String,
		required: true
	},
	feed_criteria: {
		type: Schema.Types.Mixed,
		required:true
	},
	user:{
		type: Schema.Types.ObjectId,
		ref:'User',
		required:true
	},
	created:{
		type: Date, 
		default:Date.now
	},

	updated:{
		type: Date, 
		default:Date.now
	}
	
}, {collection : 'task_feed'});

module.exports = mongoose.model('Task_Feed', TaskFeedSchema);