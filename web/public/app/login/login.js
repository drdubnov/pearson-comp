angular.module( 'Pearson.login', [
  'auth0'
])
.controller( 'LoginCtrl', function HomeController( $scope, auth, $location, store,  $http ) {

  $scope.login = function() {
    auth.signin({}, function(profile, token) {
      store.set('profile', profile);
      store.set('token', token);

      var id = auth.profile["identities"][0]["user_id"];
      var email = auth.profile["email"];
      var nickname = auth.profile["name"];

      var user_account = JSON.stringify({
        user_id:id, 
        email: email, 
        nickname: nickname, 
      });


      $http.post('http://ec2-54-149-166-225.us-west-2.compute.amazonaws.com:3001/secured/account', {data: user_account}, { 
          headers: {
          'Accept' : '*/*',
          'Content-Type': 'application/json'
         }
      }).success(function(data, status, headers, config) {
        console.log(status);
        console.log("success");
       
      }).error(function(data, status, headers, config) {
        console.log("failed");
        console.log(status); 
      });


      $location.path("/");
    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }

});
