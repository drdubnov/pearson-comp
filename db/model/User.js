var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var User = new Schema({
	user_id: {type: String, unique: true },
	nickname: String,
	email: String,
	essay: String,
	bib : [String],
	infoarea: String

	
});

module.exports = mongoose.model('User', User);
