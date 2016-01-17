var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();
var mongoose = require('mongoose');

var dbName = 'Pearson';

mongoose.connect('mongodb://ec2-52-27-56-16.us-west-2.compute.amazonaws.com/' + dbName);

app.use(session({ 
	secret: 'inTunity',
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 24 * 60 * 60 //1 day
	})
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

var whitelist = ['http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:8100'];
var cors_options = {
	origin: function (origin, callback) {
		var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
		callback(null, originIsWhitelisted);
	}
};

//Server settings
app.all('/api/*', cors(cors_options));
app.set('port', 3005);

var User = require('./model/User.js');


// var Event = require('./model/Event.js');

//routes
var router = express.Router();



// User.find({  }, function(err, user) {
//       if (err) {
//       	throw err;
//       }

//       console.log("delete");
//         // delete him
//       User.remove(function(err) {
//       if (err) {
//            throw err;
//       }
//       console.log('User successfully deleted!');

//       });
// });




router.post('/api/accounts', function (req, res, next) {

	User.findOne({user_id: req.body.user_id}, function (err, userObj) {
	    if (err) {
	      console.log(err);
	      res.sendStatus(500);
	    } else if (userObj) {
	      console.log('Found:', userObj);
	      res.sendStatus(500);
	    } else {
	      console.log('User not found!');
  		
		  var newUser = new User({
		    user_id: req.body.user_id,
		    nickname: req.body.nickname,
		    email: req.body.email,
		    essay: "",
		    bib: "",
		    last_readinfo: ""

	      });

	      newUser.save(function(err) {
           if (err) {
           	 throw err;
           } else {
             console.log('User created!');
             console.log(newUser);
             res.sendStatus(200);
           }
         });

	      	
	      		
	    }
	 });
});


router.post('/api/accounts/id/essay', function (req, res, next) {




	User.findOne({user_id: req.body.user_id}, function (err, userObj) {
	    if (err) {
	      console.log(err);
	      res.sendStatus(500);
	    } else if (userObj) {



	      userObj.essay = req.body.essay;
	      userObj.bib = req.body.bib;
	      userObj.last_readinfo = req.body.last_readinfo;


	      userObj.save(function(err) {
	    	if (err) {
	    		throw err;
	    	}	
	    	console.log(userObj);
    		res.sendStatus(200);
	  	  });	
	  }	     
	});
});


router.get('/api/accounts/id/essay' , function (req, res, next) {


	User.findOne({user_id:req.query["user_id"] }, function(err, userObj) {
	  if (err) {
	    console.log(err);
	    res.sendStatus(500);
	  } else if(userObj) {
	  	res.send(userObj);
	  } 
	});
});










app.use(router);

//Create the server
var server = app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + server.address().port);
});

app.use(function (req, res) {
	var resp = {};
	resp.error = "Not Supported.";
	res.status(404).json(resp);
});