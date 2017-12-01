var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Project Schema
var CounterSchema = new Schema({
	
	name: {
		type: String,
		required: true
	},
	seq: {
		type: Number,
		reuired:true
	}
	
}, {collection : 'counters'});

module.exports = mongoose.model('counters', CounterSchema);