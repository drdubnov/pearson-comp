angular.module( 'Pearson.home', [
'auth0'
])
.controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store, $q ) {

  $scope.auth = auth;
  $scope.nickname = auth["profile"]["name"];

  var body = document.body,
    html = document.documentElement;

  var bibcontent;
  var deferred = $q.defer();

  var lastread;
  var current_search;
   $scope.search = "";


  $scope.scrollDown = function() {
    var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
  	window.scrollBy(0, height);
  }


  $http({
	  url: 'http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/account/id/essay',
	  method: 'GET',
	  params: {
		user_id: auth.profile["identities"][0]["user_id"]
	  }
	}).success(function(data, status, headers, config) {
        console.log(data);
	   var text = document.getElementById("typearea");
		text.value = data["user"]["essay"];


        if (data["user"]["last_readinfo"] != "") {
            $scope.pullArticleContents(data["user"]["last_readinfo"]);
        }

        if ("searched_info" in data["user"] != "") {
            document.getElementById("search").value = data["user"]["searched_info"];
            $scope.searchInfo();
        }
        


		bibcontent = data["user"]["bib"];
		var temp = new Array();
		for (var i = 0; i < bibcontent.length; i++) {
			temp.push(bibcontent[i]);
		}

		deferred.resolve(temp);
		
	}).error(function(data, status, headers, config) {
	      console.log(status);
	});



	$q.all(deferred).then(function(data){
    	if (data.promise.length > 0) {
			var biblio = document.getElementById("bib");

			var i;
			var deleteButton;
			for (i = 0; i < data.promise.length; i++) {
				content = document.createElement("div");
				content.className = "row";
				content.id = "content" + i;
				var firstcol = document.createElement("div");
				firstcol.className = "col-md-8";


				firstcol.innerHTML = data.promise[i];


               


				$(firstcol).hover(	
			       function () {
			          $(this).css({"color":"red"});
			          $(this).css('cursor','pointer');
			       }, 
					
			       function () {
			          $(this).css({"color":"white"});
			          $(this).css('cursor','auto');
			       }
			    );
				var secondcol = document.createElement("div");
				secondcol.className = "col-md-4";
				deleteButton = document.createElement("button");
				deleteButton.innerHTML = "X";
                deleteButton.id = "delete" + i;
                deleteButton.style.visibility = "hidden";

                $(content).hover(  
                    function () {
                        var correctrow = ($(this).children().context.id.substring(7));
                        var correctbutton = document.getElementById("delete" + correctrow);
                        correctbutton.style.visibility = "visible";
                   },    
                   function () {
                      var correctrow = ($(this).children().context.id.substring(7));
                        var correctbutton = document.getElementById("delete" + correctrow);
                        correctbutton.style.visibility = "hidden";
                   }
                );


				
				
				secondcol.appendChild(deleteButton);
				content.appendChild(firstcol);
				content.appendChild(secondcol);
				biblio.appendChild(content);





				$(deleteButton).click(function(c) {
				  $(this).parent().parent().remove();
				  var firstcol = $(this).parent().parent().children()[0];
				  var url = $(firstcol).children()[0].id;


				  $http({
					  url: 'http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/checkArticleFree',
					  method: 'GET',
					  params: {
						url_to_check: url
					  }
					}).then(function(response) {
		

						var test = document.createElement("div");
						var container = document.createElement("div");
						window.response = response;
						for (var i = 0; i < response["data"]["result"]["text"].length; i++) {

							var strArray = response["data"]["result"]["text"][i].split(" ");

							for (var j = 0; j < strArray.length; j++) {
								var word =  document.createElement("span");

								word.innerHTML = strArray[j];
								container.appendChild(word);
								
								//Append space element
								var space =  document.createElement("span");
								space.innerHTML = " ";
								container.appendChild(space);
							}
						}

						test.appendChild(container);
						if (test.innerHTML == document.getElementById("infoarea").innerHTML) {

							document.getElementById("infoarea").innerHTML = "";
						}


					}); // end of http get
				   
				});
				$(firstcol).click(function(c) {

				  $scope.grabText($(this).children()[0].id);
                    lastread = $(this).children()[0].id;

				   
				});
			}
		}




	});




 //  .then(function(response) {
	// 	//console.log(response["data"]);

	// 	var text = document.getElementById("typearea");
	// 	text.value = response["data"]["user"]["essay"];

	// 	bibcontent = response["data"]["user"]["bib"];



		



	// });

  $scope.findMeaning = function(word) {
  	 $http({
	  url: 'http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/checkDefinition',
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
		
		document.getElementById("statusbar").innerHTML = "Definition of '" + word + "' : " + definitions[0];
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
		  document.getElementById("statusbar").innerHTML = "Definition of '" + window.word + "' : " + window.definitions[window.definitionNum];
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
	  url: 'http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/checkArticleFree',
	  method: 'GET',
	  params: {
		url_to_check: pearson_article_url
	  }
	}).then(function(response) {
		document.getElementById("infoarea").innerHTML = "";

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

			

				$(word).hover(
				
	               function () {
	                  $(this).css({"color":"red"});
	               }, 
					
	               function () {
	                  $(this).css({"color":"black"});
	               }
	            );



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
		return response
		
	}); // end of http get
  }
  
  //Grab Article Text
  $scope.grabText = function(pearson_article_url){
	  $scope.pullArticleContents(pearson_article_url);
  }
  
  window.grabText = $scope.grabText;

$('#search').on("keypress", function(e) {
        if (e.keyCode == 13) {
			$scope.searchInfo();
            current_search = document.getElementById("search").value;
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
	document.getElementById("resultsParagraph").innerHTML = "";
	window.topFiveNGrams();
	$('#myModal').modal('show');
}

//Function to return the top 5 most common N-Grams
function topFiveNGrams(){
	document.getElementById("pbar").style.visibility = "visible";
	
	$http({
	  url: 'http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/commonPhrases',
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
		"Average Sentence Length - " +  Math.round(avgSentenceLength) + "<br>" +
		"Sentence Length Standard Dev. - " + Math.round(Math.sqrt(avgSentenceVariance)) + "<br><br>";
		
		document.getElementById("resultsParagraph").innerHTML = Info1 + "<strong>Common Phrases and Frequency</strong> <br> " + response["data"]["top5"].join("<br>");
	
		//Hide Progressbar
		document.getElementById("pbar").style.visibility = "hidden";
	});
	
}

window.topFiveNGrams = topFiveNGrams;

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

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
	sentences = replaceAll(document.getElementById("typearea").value, ".", "!");
	sentences = replaceAll(sentences, ";", "!");
	sentences = replaceAll(sentences, "?", "!");
	sentences = sentences.replace(/[.,-\/#$%\^&\*:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
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
	
	//Normalize average Frequency from 0 to 10.
	averageFreq = Math.round(((23782115 - averageFreq)/23782115)*10,2);
	
	return [bestSubject,averageFreq,avgSentenceLength,avgSentenceVariance];
	
}

window.processEssay = processEssay;

$scope.searchInfo = function(){
	$http({
	  url: 'http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/searchFTArticles',
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
                lastread = results[index]["url"];
				$scope.createBib(results[index]);


			}
			new_link.innerHTML = results[i]["headline"];
			document.getElementById("results").appendChild(new_link);
			document.getElementById("results").appendChild(document.createElement("br"));
				document.getElementById("results").appendChild(document.createElement("br"));

		}



	}); // end of http get
}


$scope.createBib = function(article) {

	var authors = ''
	if ('contributors' in article) {
		if (article["contributors"].length > 0) {
			var authors_array = [];
			for (var i = 0; i < article["contributors"].length; i++) {
				var splitNamesIntoParts = article["contributors"][i].split(" ");
				var newname = splitNamesIntoParts[1] + ", " + splitNamesIntoParts[0];
				authors_array.push(newname);
			}
			for (var j = 0; j < authors_array.length; j++) {
				authors += authors_array[j] + ". ";
			}
		}
	} 
	
	var title = article["headline"];
	var website = "Financial Times";
	var url = article["article_url"];
	var day = new Date().getDate();
	var month = new Date().getMonth();
	var year = new Date().getFullYear();

	var article_date = article["article_date"];
	var article_year = article_date.substring(0,4);
	var article_month = article_date.substring(5,7);
	var article_day = article_date.substring(8,10);

	var months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov", "Dec."]

	var biblio = document.getElementById("bib");

	var p = document.createElement("p");
	p.id = article["url"];

	if (authors != '') {
		var authorspan = document.createElement("span");
		authorspan.innerHTML = authors + " ";

		var titlespan = document.createElement("span");
		titlespan.innerHTML = '"' + title + "." + '" ' ;

		var websitetitle = document.createElement("span");
			var webname_italics = document.createElement('i');
			webname_italics.innerHTML = website + ". ";
		websitetitle.appendChild(webname_italics);

		var published = document.createElement("span");
		published.innerHTML = "Financial Times, " + article_day + " " + months[article_month - 1] + " " + article_year + ". Web. ";
		
		var accessed = document.createElement("span");
		accessed.innerHTML = day + " " + months[month] + " " + year + ". " + '&lt' + url + '&gt' + ".";


		p.appendChild(authorspan);
		p.appendChild(titlespan);
		p.appendChild(websitetitle);	
		p.appendChild(published);
		p.appendChild(accessed);

	} else {
		

		var titlespan = document.createElement("span");
		titlespan.innerHTML = '"' + title + "." + '" ' ;

		var websitetitle = document.createElement("span");
			var webname_italics = document.createElement('i');
			webname_italics.innerHTML = website + ". ";
		websitetitle.appendChild(webname_italics);

		var published = document.createElement("span");
		published.innerHTML = "Financial Times, " + article_day + " " + months[article_month - 1] + " " + article_year + ". Web. ";
		
		var accessed = document.createElement("span");
		accessed.innerHTML = day + " " + months[month] + " " + year + ". " + '&lt' + url + '&gt' + ".";



		p.appendChild(titlespan);
		p.appendChild(websitetitle);	
		p.appendChild(published);
		p.appendChild(accessed);
	}
	





	var content = document.createElement("div");
	content.className = "row";


	var firstcol = document.createElement("div");
	firstcol.className = "col-md-8";
	firstcol.appendChild(p);


	var secondcol = document.createElement("div");
	secondcol.className = "col-md-4";
		var deleteButton = document.createElement("button");
        deleteButton.innerHTML = "X";
		deleteButton.id = "delete";
        deleteButton.style.visibility = "hidden";

        $(content).hover(  
            function () {
                deleteButton.style.visibility = "visible";
           },    
           function () {
                deleteButton.style.visibility = "hidden";
           }
        );

		deleteButton.onclick = function() {
			biblio.removeChild(content);

			var info = document.getElementById("infoarea");
			var text = (info.innerHTML);
			document.getElementById("infoarea").innerHTML = "";
		}


	secondcol.appendChild(deleteButton);
	content.appendChild(firstcol);
	content.appendChild(secondcol);


	content.onclick = function() {
         lastread = article["url"];
		$scope.grabText(article["url"]);
	}

	$(firstcol).hover(	
       function () {
          $(this).css({"color":"red"});
           $(this).css('cursor','pointer');
       }, 
		
       function () {
          $(this).css({"color":"white"});
           $(this).css('cursor','auto');
       }
    );


	biblio.appendChild(content);


}

$scope.saveEssay = function() {
	var essay = document.getElementById("typearea").value;
	var id = auth.profile["identities"][0]["user_id"];

	var citations = document.getElementsByClassName("col-md-8");
	var sources = new Array();
	for (var i = 0; i < citations.length; i++) {
		console.log(citations[i].innerHTML);
		sources.push(citations[i].innerHTML);
	}

    console.log(document.getElementById("infoarea").innerHTML);


    var essayinfo = JSON.stringify({
        user_id:id, 
        essay: essay,
        bib: sources,
        last_readinfo: lastread,
        searched_info: document.getElementById("search").value
    });



	$http.post('http://ec2-52-27-56-16.us-west-2.compute.amazonaws.com:3001/secured/account/id/essay', {data: essayinfo}, { 
	    headers: {
	    'Accept' : '*/*',
	    'Content-Type': 'application/json'
	   }
	}).success(function(data, status, headers, config) {
	      console.log(status);
		
	}).error(function(data, status, headers, config) {
	      console.log(status);
	});

}






  

});
