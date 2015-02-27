angular.module('thesisApp')
  .factory('cartFactory', ['$http', 'Auth', 'localStorageService', '$rootScope', function($http, Auth, localStorageService, $rootScope) {
    var cart = {};
    cart.amazonCart = {};

    //add item to db
    cart.addItem = function(items, item, user) {

      //push item into local item array
      items.push(item);

      //if it's the first item create a row
      if (items.length === 1) {
        $http.put('/api/carts/name/' + user, items)
          .success(function(data) {
            console.log('successful res  from client create', data)

          })
          .error(function(err) {
            console.log("ERROR from client Create: ", err)
          })
      } else {
        //if  not the first item update  the row

        $http.post('/api/carts/name/' + user, items)
          .success(function(data) {
            console.log('successful res  from client', data)

          })
          .error(function(err) {
            console.log("ERROR: ", err)
          })
      }
      return items
    };

    //removes item locally and from db
    cart.removeItem = function(items, item, user) {
      //remove item from items locally
      items.splice(items.indexOf(item), 1);

      //add to db
      $http.post('/api/carts/name/' + user, items)
        .success(function(data) {
          console.log('successful res from client', data)

        })
        .error(function(err) {
          console.log("ERROR REMOVING ITEM: ", err)
        });

      console.log(items);
      return items;
    };
    //calculate price of items in local cart
    cart.totalCharge = function(items) {
      var totalCharge = 0;
      items = items || [];
      for (var i = 0; i < items.length; i++) {
        totalCharge = totalCharge + parseFloat(items[i].price);
      }

      return totalCharge.toFixed(2);
    };

    cart.getItems = function(user) {
      $http.get('/api/carts/name/' + user)
        .success(function(data) {
          console.log(data);
          return data
        })
        .error(function(err) {
          console.log("ERROR: ", err);
        })

    };
    //clear items for user locally and in db
    cart.dropSchema = function(user) {
      $http.delete('/api/carts/name/' + user)
        .success(function(msg) {
          console.log('Success dropping Schema: ', msg);
        })
        .error(function(err) {
          console.log('Error: ', err);
        })
    };
    //return the CartFactory object

    ////AMAZON CART FUNCTIONALITY

    cart.amazonGetCart = function(callback) {
      //console.log("FROM FACTORY WHEN GETTING CART + HMAC ", cartId, HMAC)

      $http.post('/api/amazoncarts/get', {})
        .success(function(data) {
          console.log('cart from AMAZON:  ', data);
          callback(data);
        })
        .error(function(err) {
          console.log("ERROR getting Cart ", err);
          callback(data);
        });
    };

    cart.amazonRemoveProduct = function(product, amazonCart) {

      var newquantity;
      var emptyCart = true;
      //if find and update quantity in serverside cart
      // console.log("AMAZON CART AT REMOVE", cart.amazonCart)
      for (var i = 0; i < cart.amazonCart.items.length; i++) {
        if (cart.amazonCart.items[i]['quantity'] > 0) {
          emptyCart = false
        }
        if (product === cart.amazonCart.items[i]['productId']) {
          if (cart.amazonCart.items[i]['quantity'] > 0) {
            console.log("LOCAL CART ITEM Q AT REMOBE", cart.amazonCart.items[i]['quantity'])
            newquantity = --cart.amazonCart.items[i]['quantity'];
            break;
          }
        }
        newquantity = newquantity || 0;


      }
      return $http.post('/api/amazoncarts/modify', {
        'id': product,
        'productId': product,
        'CartId': cart.amazonCart['CartId'],
        'HMAC': cart.amazonCart['HMAC'],
        'Quantity': newquantity
      })



      .success(function(data) {
          cart.amazonCart['Qty'] --;
          cart.saveLocally(cart.amazonCart)

          console.log('successful res from AMAZON client', data)
        })
        .error(function(err) {
          console.log("ERROR creating Cart ", err)
        });

    };

    cart.amazonAddProduct = function(product, amazonCart) {
      //console.log("A CART FROM ADD PRODCUT", amazonCart);\
      var newquantity;
      cart.amazonCart.items = cart.amazonCart.items || [];
      for (var i = 0; i < cart.amazonCart.items.length; i++) {
        if (product === cart.amazonCart.items[i]['productId']) {
          newquantity = cart.amazonCart.items[i]['quantity'] + 1;
          var currentItem = i;
          var updated = true
          break;
        }
      }
      if (updated !== true) {
        cart.amazonCart.items.push({
          "productId": product,
          "quantity": 1
        });
        currentItem = cart.amazonCart.items.length - 1;
      }
      //console.log('WHEN ADDING ITEM', amazonCart['CartId'], newquantity)
      $http.post('/api/amazoncarts/modify', {
          'id': product,
          'productId': product,
          'CartId': cart.amazonCart['CartId'],
          'HMAC': cart.amazonCart['HMAC'],
          'Quantity': newquantity || 1
        })
        .success(function(data) {
          if (data['Quantity'] > cart.amazonCart['Qty']) {
            if (updated === true) {
              amazonCart.items[currentItem].quantity++;
            };
            cart.amazonCart['Qty'] = data['Quantity'];
            cart.saveLocally(cart.amazonCart);

          }
        })
        .error(function(err) {
          console.log("ERROR creating Cart ", err)
        });

    };

    cart.amazonCreateCart = function(itemId) {
      // console.log(Auth.getCurrentUser().id)
      console.log("CREATING CART")
      $http.post('/api/amazoncarts/create', {
          'id': itemId
        })
        .success(function(data) {
          cart.amazonCart = {
            "CartId": data.CartId[0],
            "HMAC": data.HMAC[0],
            "items": [],
            "Qty": 1
          };

          cart.amazonCart.items.push({
            "productId": data.CartItems[0].CartItem[0].ASIN[0],
            "quantity": 1
          });
          cart.saveLocally(cart.amazonCart)

        })
        .error(function(err) {
          console.log("ERROR creating Cart ", err)
        });
    };

    cart.amazonClearCart = function() {
      // console.log(Auth.getCurrentUser().id)

      $http.post('/api/amazoncarts/clear', {})
        .success(function(data) {
          cart.amazonCart = {
            "CartId": data.CartId[0],
            "HMAC": data.HMAC[0],
            "items": []
          };
          cart.saveLocally(cart.amazonCart)
        })
        .error(function(err) {
          console.log("ERROR creating Cart ", err)
        });
    };
    cart.saveLocally = function(Cart) {
      localStorageService.set('Cart', Cart)
      $rootScope.$broadcast('changeCartQuantity')
    };
    return cart;
  }]);
// cart.updatePils = function() {

// }