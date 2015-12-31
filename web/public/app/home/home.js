angular.module( 'Pearson.home', [
'auth0'
])
.controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store ) {

  $scope.auth = auth;

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
		//Paragraph [0] xD

		
		document.getElementById("infoarea").innerHTML = "";

		for (var i = 0; i < response["data"]["result"]["text"].length; i++) {
			document.getElementById("infoarea").innerHTML += response["data"]["result"]["text"][i];
		}





	


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

textScrollUp = function(){
	document.getElementById("infoarea").scrollTop +=300
}

textScrollDown = function(){
	document.getElementById("infoarea").scrollTop -=300
}

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
