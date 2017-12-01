var express = require('express');
var router = express.Router();
var multer  = require('multer');
var TaskJsonParser = require('../../task/task.upload.file.parser.js');

var uploadFile = multer(
  {
    storage: multer.memoryStorage(),
  })
  .single('file');

router.post('/json',
 function(req, res) {

	  		console.log('execution here../json');

	  		//console.log('req.file ====== ' + JSON.stringify(req.file));
		    //var taskCount = TaskJsonParser.parseFile(req,res);
			//return res.json({ message: 'Task creation successfully completed' });


				uploadFile(req, res, function(error) {
    				if (error) { }
    				var file = req.file || null;
				    if (file) {
				      var data = JSON.parse(file.buffer.toString());
				      console.log('json data: ' + JSON.stringify(data));
				      var taskCount = TaskJsonParser.parseFile(req,res, JSON.stringify(data));
				      return res.json({ message: 'Task creation successfully completed' });
				    }
				});

			
			
		});


module.exports = router;