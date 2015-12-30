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
			  output.push(response["data"]["articles"]["results"][i]);
		  }
	  }
	  
	  return output;
  }
   
	$scope.search = function(){
    $http({
      url: 'http://localhost:3001/secured/searchFTArticles',
      method: 'GET',
      params: {
      	search: document.getElementById("textarea1").text
      }
    }).then(function(response) {
		results = $scope.removeDuplicates(response);
		document.getElementById("results").innerHTML = (response["data"]["articles"]["count"] == 0) ? "No results yet" : "";

		for (var i =0;i<results.length;i++){
			new_link = '<a href = "' + results[i]["article_url"] + '">' + results[i]["headline"] + '</a>';
			document.getElementById("results").innerHTML += new_link + "<br><br>";
		}
        console.log(response["data"]["articles"]);
    }); // end of http get
	}

  

});
