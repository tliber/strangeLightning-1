'use strict';

angular.module('thesisApp')
  .controller('CartCtrl', ['$scope', '$state', 'cartFactory', 'Auth',
    function($scope, $state, cartFactory, Auth) {
      //where local items are stored
      $scope.user = Auth.getCurrentUser().email;
      $scope.items = 0;

      //returns all items from db schema,
      $scope.getItems = function() {
        cartFactory.amazonGetCart(function(data){
          if(data.CartItems && data.CartItems[0] && data.CartItems[0].CartItem){
            $scope.items = data.CartItems[0].CartItem || [];
          }

        });
      };

      //add item to db
      $scope.addItem = function(item) {
        //$scope.items = cartFactory.addItem($scope.items, item, $scope.user);
        $scope.charge = (parseFloat($scope.charge) + parseFloat(item.price)).toFixed(2);
      };

      //remove item locally and from db
      $scope.removeItem = function(items, item) {
        $scope.charge = (parseFloat($scope.charge) - parseFloat(item.price)).toFixed(2);
        //$scope.items = cartFactory.removeItem($scope.items, item, $scope.user);
      };

      //scope.charge is rendered total price on screen
      //cartFactory.totalCharge calculates total price of items
      $scope.charge = cartFactory.totalCharge($scope.items);

      //clear items locally and drop schema
      $scope.dropSchema = function() {

        cartFactory.amazonClearCart();
      };

      /* Set height of window */
      var block = $(window).height();
      var navbar = $('.navbar').height();
      $('#cart').css({
        height: block - navbar - 1
      });

      $scope.close = function() {
        $('#cart').animate({
          'margin-right': '-=1000'
        }, 500);
        $state.transitionTo('catalog');
      };

      //init
      $scope.getItems();

    }
  ]);
