var User = require('../../api/user/user.model')
exports.setup = function(profile, done) {
  console.log('this is the profile before saving: ', profile)
  User.findOne({
      'amazon.id': profile.CustomerId
    },
    function(err, user) {
      if (err) {
        console.log('err from line 8 in auth first function', err);
      }
      if (!user) {
        user = new User({
          name: profile.Name,
          email: profile.PrimaryEmail,
          role: 'user',
          username: profile.Name,
          provider: 'amazon',
          amazon: profile.CustomerId
        });
        user.save(function(err) {
          if (err) console.log('error saving user', err);
        // console.log('useeeeerrrrrr', user)
        // console.log(done)
          done(user);
          return user;
        });
      } else {
        done(user)
        return user;
      }
    })
}