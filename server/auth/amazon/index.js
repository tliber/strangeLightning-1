'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var config = require('../../config/environment/index.js');
var amazonOAuth = require('./auth.js')
  // console.log("CCONONNNFFIIIGG IS AVAILABLE", config)

var router = express.Router();
var app = express()
router
  .get('/', function() {
    console.log('hit the server')
  })

router.get('/publicClientAuth', function(req, res) {

  res.send(config.amazonOAuth.clientID)
    // amazon.Login.setClientId(config.amazonOAuth.ClientID);
})
router.post('/login', function(req, res) {
  console.log('only bodu', req.body)
  var user_profile = req.body.user.profile
  console.log("THIS SHOUDL BE the TOKEN", JSON.parse(req.cookies.amazon_Login_state_cache).access_token)

  if (JSON.parse(req.cookies.amazon_Login_state_cache).access_token) {
    var access_token = JSON.parse(req.cookies.amazon_Login_state_cache).access_token
    console.log('user profile before amazonOAuth', user_profile)
    amazonOAuth.setup(user_profile, function(user) {
        console.log("this should be the user returned from mongo", user)
        req.user = user;
        auth.setTokenCookie(req, res)
      })
      // auth.setTokenCookie(req, res)
  }
})

// router.get('/',
//   passport.authenticate('amazon'));

// router.get('/callback',
//   passport.authenticate('amazon', {
//     failureRedirect: '/login'
//   }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });
// // router
//   .get('/', passport.authenticate('amazon', {
//     // scope: ['email', 'user_about_me'],
//     failureRedirect: '/signup',
//     session: false
//   }))

// .get('/callback', passport.authenticate('amazon', {
//   failureRedirect: '/signup',
//   session: false
// }), auth.setTokenCookie);

module.exports = router;