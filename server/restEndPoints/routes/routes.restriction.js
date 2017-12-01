var moment = require('moment');
var jwt = require('jwt-simple');
var properties = require('../../common/config/application-properties');

var ensureAuthentication = function (req, res, next) {
  
  console.log('Inside ensureAuthenticated()..' + JSON.stringify(req.get('Authorization')));
  
  if(req.originalUrl === '/login'){
  	next();
  }else{
	  	if (!req.get('Authorization')) {
	    	return res.status(401).send(
	    	{ message: 'Please make sure your request has an Authorization header' });
	  	}
	  
	  var token = req.get('Authorization').split(' ')[1];

	  var payload = null;
	  try {
	    payload = jwt.decode(token, properties.oAuth.tokenSecret);
	  }
	  catch (err) {
	    return res.status(401).send({ message: err.message });
	  }

	  if (payload.exp <= moment().unix()) {
	    return res.status(401).send({ message: 'Token has expired' });
	  }
	  req.user = payload.sub;
	  next();
  }
  
}

module.exports = ensureAuthentication;