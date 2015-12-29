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

  
   

    $http({
      url: 'http://localhost:3001/secured/searchFTArticles',
      method: 'GET',
      params: {
      	search: "Economy"
      }
    }).then(function(response) {
        console.log(response["data"]["articles"]);
    }); // end of http get



  

});
