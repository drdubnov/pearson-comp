angular.module( 'Pearson.home', [
'auth0'
])
.controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store ) {

  $scope.auth = auth;

  $scope.findMeaning = function(word) {
  	  $http({
	  url: 'http://localhost:3001/secured/checkDefinition',
	  method: 'GET',
	  params: {
		word_to_check: word
	  }
	}).then(function(response) {
		var definitions = [];
		for (var i =0;i< response["data"]["results"].length;i++){
			window.objx = response["data"]["results"][i];
			if (response["data"]["results"][i]["senses"] != null && response["data"]["results"][i]["senses"][0] != null){
				if (response["data"]["results"][i]["senses"][0]["definition"] != null){
					definitions.push(response["data"]["results"][i]["senses"][0]["definition"]);
				}
			}
		}
		
		document.getElementById("statusbar").innerHTML = "Status: Definition of '" + word + "' : " + definitions[0];
		console.log(response["data"]);
		
		window.definitionNum = 0;
		window.word = word;
		window.definitions = definitions;
		
		document.getElementById("toggleButton").style.visibility = "visible";
	}); // end of http get

  }
  
  toggleStatus = function(){
	  if (window.definitions != null){
		  window.definitionNum = (window.definitionNum+1) % window.definitions.length;
		  document.getElementById("statusbar").innerHTML = "Status: Definition of '" + window.word + "' : " + window.definitions[window.definitionNum];
	  }
  }
  
  $scope.logout = function() {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $location.path('/login');
  }

  //Remove duplicates from Pearson API
  $scope.removeDuplicates = function(response){
	  output = [];
	  
	  for (var i =0;i<response["data"]["articles"]["count"];i++){
		  var foundDuplicate = false;
		  for (var j = 0;j<output.length;j++){
			  if (response["data"]["articles"]["results"][i]["article_url"] == output[j]["article_url"]) {
				   foundDuplicate = true;
			  }
		  }
		  
		  if (foundDuplicate == false){
			window.article = response["data"];
			output.push(response["data"]["articles"]["results"][i]);
		  }
	  }
	  
	  return output;
  }
   
  //Run article through Pearson API to retrieve data
  $scope.pullArticleContents = function(pearson_article_url){
	var result = "EMPTY";
	$http({
	  url: 'http://localhost:3001/secured/checkArticleFree',
	  method: 'GET',
	  params: {
		url_to_check: pearson_article_url
	  }
	}).then(function(response) {

		var info = document.getElementById("infoarea");
		var container = document.createElement("div");
		window.response = response;
		for (var i = 0; i < response["data"]["result"]["text"].length; i++) {

			var strArray = response["data"]["result"]["text"][i].split(" ");

			for (var j = 0; j < strArray.length; j++) {
				var word =  document.createElement("span");

				word.innerHTML = strArray[j];



				word.onclick = function() {
					var results = $scope.findMeaning(this.innerHTML);
					

				}
				container.appendChild(word);
				
				//Append space element
				var space =  document.createElement("span");
				space.innerHTML = " ";
				container.appendChild(space);
				
				

			}

			





			// document.getElementById("infoarea").innerHTML += response["data"]["result"]["text"][i];
		}

		info.appendChild(container);



		window.objectX = response;
		//window.objectX["data"]["result"]["text"][1]
		return response;
	}); // end of http get
  }
  
  //Grab Article Text
  $scope.grabText = function(pearson_article_url){
	  $scope.pullArticleContents(pearson_article_url);
  }
  
  window.grabText = $scope.grabText;

$('#search').on("keypress", function(e) {
        if (e.keyCode == 13) {
			$scope.search();
            return false; // prevent the button click from happening
        }
});

// textScrollUp = function(){
// 	document.getElementById("infoarea").scrollTop +=300
// }

// textScrollDown = function(){
// 	document.getElementById("infoarea").scrollTop -=300
// }

var copyTextareaBtn = document.querySelector('#copyButton');

copyTextareaBtn.addEventListener('click', function(event) {
  var copyTextarea = document.querySelector('#typearea');
  copyTextarea.select();
	
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }
});

//Generate word frequency list at the start of the application
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "/app/home/wordFrequencyList.csv",
        dataType: "text",
        success: function(data) {processData(data);}
     });
});

//Process the CSV file and store in Javascript data structure
function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = new Object();
	
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
				//headers[j]
				input = (data[j]).slice(0, -1).slice(1).trim().toLowerCase();
                tarr.push(input);
            }
			
			word = (data[2]).slice(0, -1).slice(1).trim().toLowerCase();
			
			window.swag = word;
			lines[word] = tarr;
        }
    }

	//Store it as a global variable in the window object
    window.wordFreqList = lines;
}

//Run results to modal
window.showResults = function(){
	window.topFiveNGrams();
	$('#myModal').modal('show');
}

//Function to return the top 5 most common N-Grams
function topFiveNGrams(){
	document.getElementById("pbar").style.visibility = "visible";
	
	$http({
	  url: 'http://localhost:3001/secured/commonPhrases',
	  method: 'GET',
	  params: {
		essay: document.getElementById("typearea").value
	  }
	}).then(function(response) {
		results = processEssay();
		bestSubject = results[0];
		averageFreq = results[1];
		avgSentenceLength = results[2];
		avgSentenceVariance = results[3];
		
		Info1 = "<strong>Basic Text Information</strong> <br>" + 
		"Predicted topic - " + bestSubject + "<br>" +
		"Word Uniqueness Score - " + averageFreq + "<br>" +
		"Average Sentence Length - " + avgSentenceLength + "<br>" +
		"Sentence Length Variance - " + avgSentenceVariance + "<br><br>";
		
		document.getElementById("resultsParagraph").innerHTML = Info1 + "<strong>Common Phrases and Frequency</strong> <br> " + response["data"]["top5"].join("<br>");
	
		//Hide Progressbar
		document.getElementById("pbar").style.visibility = "hidden";
	});
	
}

window.topFiveNGrams = topFiveNGrams;

//Function to process the contents of the essay and compute statistics on it
function processEssay() {
	essayText = document.getElementById("typearea").value;
	
	//Remove all punctuation from essay
	//Verify this for errors just in case
	essayText = essayText.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
	
	//Split to get the words
	words = essayText.split(" ");
	
	//Compute the rank of each word
	rankOfWords = new Object();
	
	for (var i =0;i<words.length;i++){
		current = words[i].trim().toLowerCase();
		
		//Check if the word is in our list
		if (current in window.wordFreqList){
			//Grab Info from Freq List
			grabWordInfo = window.wordFreqList[current];
			
			//This is where the thought comes in.. 
			//Let's start with computing the average rank.
			window.swag = current
			rankOfWords[current] = grabWordInfo
		}
	}
	
	//Compute the average rank
	averageFreq = 0;
	
	//Compute the probabilities for each subject (using Naive Bayes Assumption)
	//More specifically, the Multi-variate Bernoulli event model.
	subjectProbabilities = [];
	subjectProbabilities['spoken'] = 0;
	subjectProbabilities['fiction'] = 0;
	subjectProbabilities['magazine'] = 0;
	subjectProbabilities['newspaper'] = 0;
	subjectProbabilities['academic'] = 0;
	
	
	count = 0;
	for (var key in rankOfWords) {
		if (rankOfWords.hasOwnProperty(key)){
			averageFreq +=parseInt(rankOfWords[key][3])
			
			totalFreq = parseFloat(rankOfWords[key][3]);
			
			//Compute the likelihood
			/*subjectProbabilities['spoken'] *= parseFloat(rankOfWords[key][4])/totalFreq;
			subjectProbabilities['fiction'] *= parseFloat(rankOfWords[key][5])/totalFreq;
			subjectProbabilities['magazine'] *= parseFloat(rankOfWords[key][6])/totalFreq;
			subjectProbabilities['newspaper'] *= parseFloat(rankOfWords[key][7])/totalFreq;
			subjectProbabilities['academic'] *= parseFloat(rankOfWords[key][8])/totalFreq;*/
			
			
			//Compute the log likelihood instead (better precision)!
			subjectProbabilities['spoken'] += Math.log10(parseFloat(rankOfWords[key][4])/totalFreq);
			subjectProbabilities['fiction'] += Math.log10(parseFloat(rankOfWords[key][5])/totalFreq);
			subjectProbabilities['magazine'] += Math.log10(parseFloat(rankOfWords[key][6])/totalFreq);
			subjectProbabilities['newspaper'] += Math.log10(parseFloat(rankOfWords[key][7])/totalFreq);
			subjectProbabilities['academic'] += Math.log10(parseFloat(rankOfWords[key][8])/totalFreq);
			count +=1;
		}
	}
	
	window.subjectProbabilities = subjectProbabilities;
	//Computes the Average Frequency
	averageFreq = parseInt(averageFreq/(count));
	
	//Computes whether this article is likely to be "SPOKEN","FICTION","MAGAZINE","NEWSPAPER","ACADEMIC"
	bestSubject = '';
	bestResult = -Infinity;
	for (var subj in subjectProbabilities){
		if (subjectProbabilities.hasOwnProperty(subj)){
			if (subjectProbabilities[subj] > bestResult){
				bestSubject = subj;
				bestResult = subjectProbabilities[subj];
			}
		}
	}
	
	//Computes average sentence length
	sentences = document.getElementById("typearea").value.replace(".","!");
	sentences = sentences.replace(/[.,-\/#$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
	sentences = sentences.trim().split("!");
	
	avgSentenceLength = 0;
	avgSentenceVariance = 0;
	count = 0;
	for (var i =0;i < sentences.length; i ++){
		//Grab sentence
		sentence = sentences[i];
		
		//Compute length of sentence
		if (sentence != ""){
			ln = sentence.trim().split(" ").length;
			avgSentenceLength += ln;
			count +=1;
		}
	}
	
	avgSentenceLength = (avgSentenceLength / count);
	
	//Computes Sample Variance
	for (var i =0;i < sentences.length; i ++){
		//Grab sentence
		sentence = sentences[i];
		
		//Compute length of sentence
		if (sentence != ""){
			ln = sentence.trim().split(" ").length;
			avgSentenceVariance += (ln - avgSentenceLength)*(ln - avgSentenceLength);
		}
	}
	
	//Computes using Unbiased Estimate Formula
	avgSentenceVariance = avgSentenceVariance * 1/(count-1);
	
	return [bestSubject,averageFreq,avgSentenceLength,avgSentenceVariance];
	
}

window.processEssay = processEssay;

$scope.search = function(){
	$http({
	  url: 'http://localhost:3001/secured/searchFTArticles',
	  method: 'GET',
	  params: {
		search: document.getElementById("search").value
	  }
	}).then(function(response) {
		results = $scope.removeDuplicates(response);
		document.getElementById("results").innerHTML = (response["data"]["articles"]["count"] == 0) ? "No results yet" : "";

		for (var i =0;i<results.length;i++){
			
			var new_link = document.createElement("a");
			new_link.id = i;
			new_link.onclick = function() {
				var index = this.id;
				$scope.grabText(results[index]["url"]);
				$scope.getBib(results[index]);

			}
			new_link.innerHTML = results[i]["headline"];
			document.getElementById("results").appendChild(new_link);
			document.getElementById("results").appendChild(document.createElement("br"));

		}



	}); // end of http get
}

 $scope.getBib = function(obj) {
	console.log(obj);
}




  

});
