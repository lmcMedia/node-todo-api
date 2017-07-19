const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// =====================================================================
// MODEL methods
// =====================================================================
// determines what is sent back when a Mongoose model
// is converted to a JSON object
UserSchema.methods.toJSON = function () {
  let user = this;
  // converts mongoose variable user into object where only properties exist
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// arrow functions DO NOT bind the 'this' keyword. Since we
// need 'this' here, we will just use function() {}
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  // returns the returned token after the user has been saved
  return user.save().then(() => {
    return token;
  });
};

// Remove any object from the array that has a token property = to the
// the value that we pass in. This will delete the users current token.
// Using MonogoDB operator called $pull. Lets you remove items from an
// array that match certain criteria
UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

// =====================================================================
// STATIC methods
// =====================================================================
// Model method, not instance method
UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

// statics are Model methods
UserSchema.statics.findByCredentials = function (email,password) {
  let User = this;

  return User.findOne({email}).then((user) => {
    if (!user) return Promise.reject();
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user); // inside of Promise so dont need Promise.resolve
        } else {
          reject();
        };
      });
    });
  });
};

// =====================================================================
// PRE method
// =====================================================================
// need access to 'this' so we cannot use ES6 () =>
UserSchema.pre('save', function (next) {
  var user = this;
  // prevent re-hashing of hashed PASSWORDS
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else { // if user password not modified, then just move on
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User}
