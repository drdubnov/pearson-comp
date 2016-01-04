var http = require('http');
var express = require('express');
var cors = require('cors');
var app = express();
var jwt = require('express-jwt');
var dotenv = require('dotenv');

var request = require('request');

dotenv.load();

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});


app.configure(function () {

 // Request body parsing middleware should be above methodOverride
  app.use(express.bodyParser());
  app.use(express.urlencoded());
  app.use(express.json());

  app.use('/secured', authenticate);
  app.use(cors());

  app.use(app.router);
});


app.get('/ping', function(req, res) {
  res.send(200, {text: "All good. You don't need to be authenticated to call this"});
});

app.get('/secured/ping', function(req, res) {
  res.send(200, {text: "All good. You only get this message if you're authenticated"});
});


//search for a specific topic
app.get('/secured/searchFTArticles', function(req, res) {
  console.log(req.query["search"]);
  request({
      url: 'http://api.pearson.com/v2/ft/articles', //URL to hit
      headers: {
      'Content-Type': 'application/json'
      },
      method: 'GET', //Specify the method
      qs: {search: req.query["search"], limit:1000}
  }, function(error, response, body){
   

      if(error) {
          console.log(error);
      } else {
        if (response.statusCode == 200) {
          var data = JSON.parse(response.body);
          console.log(data);
          res.send(200, {articles:data});
        }
      }
  });
});

//Pull Pearson Article!
app.get('/secured/checkArticleFree', function(req, res) {
  request({
      url: "http://api.pearson.com" + req.query["url_to_check"], //Article URL to verify
      headers: {
		'Content-Type': 'application/json'
      },
      method: 'GET', //Specify the method
      qs: {}
  }, function(error, response, body){
	   if(error) {
          console.log(error);
      } else {
          var data = JSON.parse(response.body);
		  res.send(200, data);
      }
  });
});



//natural language processing
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();


//Run Sentiment Analysis
app.get('/secured/sentimentAnalysis', function(req, res) {
	essayText = req.query["essay"];
	
	var NGrams = natural.NGrams;
	var answer = NGrams.ngrams('some other words here for you', 4);
	res.send(200, {sentiment:answer});   
});


//Most common phrases
app.get('/secured/commonPhrases', function(req, res) {
	essayText = req.query["essay"];
	
	var NGrams = natural.NGrams;
	var counts = new Object();
	
	//Compute N-Grams from unit size 3 to unit size 6.
	for (var ngram_length = 3;ngram_length < 6;ngram_length +=1){
		var blocks = NGrams.ngrams(essayText, ngram_length);
		
		for (var i = 0;i<blocks.length;i++){
			word = blocks[i];
			word = word.join(" ").trim().toLowerCase();
			
			if ((word in counts) == false){
				counts[word] = 1;
			}
			else{
				counts[word] +=1;
			}
		}
	}
	
	//Find top 5 N-Grams
	var mostCommon = [];
	for (var i =0;i<5;i++){
		//Get largest
		var bestWord = '';
		var bestFreq = 0;
		
		for (var j = 0;j < Object.keys(counts).length;j++){
			word = Object.keys(counts)[j];
			totalC = counts[word];
			console.log(totalC);
			
			if (counts[word] >= bestFreq){
				bestWord = word;
				bestFreq = counts[word];
			}
		}
		
		//Push to our most common list
		mostCommon.push("Phrase: " + bestWord + " - Number of Occurances: " + bestFreq);
		
		//Remove from future choices (so it doesn't get chosen again)
		counts[bestWord] = 0;
	}
		  
	//Send the top 5 most common words!
	res.send(200, {top5:mostCommon});   
});




var port = process.env.PORT || 3001;

http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});