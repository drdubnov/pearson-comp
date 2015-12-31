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
		alert(response["data"]["result"]["text"][0]);
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
  
$scope.search = function(){
	$http({
	  url: 'http://localhost:3001/secured/searchFTArticles',
	  method: 'GET',
	  params: {
		search: document.getElementById("textarea1").value
	  }
	}).then(function(response) {
		results = $scope.removeDuplicates(response);
		document.getElementById("results").innerHTML = (response["data"]["articles"]["count"] == 0) ? "No results yet" : "";

		for (var i =0;i<results.length;i++){
			URL = results[i]["url"];
			new_link = '<a onclick="grabText(\'' + URL + '\')">' + results[i]["headline"] + '</a>';
			document.getElementById("results").innerHTML += new_link + "<br><br>";
		}
	}); // end of http get
}

  

});
