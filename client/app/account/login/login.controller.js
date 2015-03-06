'use strict';

angular.module('thesisApp')
  .controller('LoginCtrl', ['$scope', 'Auth', '$location', '$window', '$document', '$http', function($scope, Auth, $location, $window, $document, $http) {
    $scope.user = {};
    $scope.errors = {};

    /* Set height of window */
    var block = $(window).height();
    var navbar = $('.navbar').height();
    $('#login').css({
      height: block - navbar - 1
    });

    // $scope.close = function() {
    //   $('#cart').animate({
    //     'margin-right': '-=1000'
    //   }, 500);
    // }
    $scope.authenticate = function(document) {
      var authenticate = document.createElement('script');
      authenticate.type = 'text/javascript';
      authenticate.async = true;
      authenticate.id = 'amazon-login-sdk';
      authenticate.src = 'https://api-cdn.amazon.com/sdk/login1.js';
      document.getElementById('amazon-root').appendChild(authenticate);
    };


    //verifies public client key to amazon API
    $window.onAmazonLoginReady = function() {
      $http.get('auth/amazon/publicClientAuth').success(function(data) {
        amazon.Login.setClientId(data)
          //Loads Amazon SDK
        $scope.authenticate(document)
      })


    }
    $scope.amazonLogin = function() {
      var options = {
        scope: 'profile'
      };
      amazon.Login.authorize(options, function(response) {
        if (response.error) {
          alert('oauth error ' + response.error);
          return false;
        } else if (response.access_token) {
          amazon.Login.retrieveProfile(response.access_token, function(data) {
            var account = {
              "user": data,
            }
            $http.post('auth/amazon/login', account)
              // $http.post('auth/amazon/login', );
            console.log('logged in')
          })
        }
      });
      return false;
    }
    $scope.amazonLogout = function() {
      console.log('logout from Sphereable')
      amazon.Login.logout()

    };
    // $scope.LoginWithAmazon = function() {
    //   var options = {
    //     scope: 'profile'
    //   };
    //   amazon.Login.authorize(options,
    //     'https://sphereable.com/handle_login.php');
    //   return false;
    // };
    $scope.login = function(form) {
      $scope.submitted = true;

      if (form.$valid) {
        Auth.login({
            email: $scope.user.email,
            password: $scope.user.password
          })
          .then(function() {
            // Logged in, redirect to home
            $location.path('/');
          })
          .catch(function(err) {
            $scope.errors.other = err.message;
          });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);