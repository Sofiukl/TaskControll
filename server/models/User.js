const User = require('../../src/app/models/user');

/*User.getUser = function(username){

	return new Promise((resolve, reject) => {
		var query = {username: username};
		const cb = (err, user) => {
			if(err){
				reject(err);
			}else{
				resolve(user);
			}
		};
		User.findOne(query, cb);
	});

}*/

module.exports = User;