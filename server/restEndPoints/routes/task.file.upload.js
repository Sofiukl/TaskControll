var mongojs = require('mongojs');
var validator = require('validator');
var express = require('express');
var multer  = require('multer');
var app = express();
var uploadRoute = express.Router();

//api for CRUD operation on task documents

//  http://localhost:port/api/task/multer/

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './task_uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.originalname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});
const upload = multer({ storage: storage }).single('file');

uploadRoute.route('/attachement/upload')
	.post(function(req, res) {
			upload(req,res,function(err){
		        if(err){
		             res.json({error_code:1,err_desc:err});
		             return;
		        }
		         res.json({error_code:0,err_desc:null});
		    })
	});

module.exports = uploadRoute;	