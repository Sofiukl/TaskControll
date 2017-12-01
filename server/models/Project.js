var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Project Schema
var ProjectSchema = new Schema({
	
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	startDate:{
		type:Date
	},
	completionDate:{
		type:Date
	},
	status:{
		type:String,
		required: true
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
	
}, {collection : 'projects'});

module.exports = mongoose.model('Project', ProjectSchema);