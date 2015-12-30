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

  
   
	$scope.search = function(){
    $http({
      url: 'http://localhost:3001/secured/searchFTArticles',
      method: 'GET',
      params: {
      	search: "Economy"
      }
    }).then(function(response) {
		window.legend = response["data"]["articles"]["results"][0];
		document.getElementById("results").innerHTML = (response["data"]["articles"]["count"] == 0) ? "No results yet" : "";
		for (var i =0;i<response["data"]["articles"]["count"];i++){
			new_link = '<a href = "' + response["data"]["articles"]["results"][i]["article_url"] + '">' + response["data"]["articles"]["results"][i]["headline"] + '</a>';
			document.getElementById("results").innerHTML += new_link + "<br><br>";
		}
        console.log(response["data"]["articles"]);
    }); // end of http get
	}

  

});
