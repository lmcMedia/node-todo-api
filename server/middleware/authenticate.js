var {User} = require('./../models/user');

// middleware function
var authenticate = (req, res, next) => {
  let token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) return Promise.reject();

    req.user = user; // available in req of route
    req.token = token;
    next();
  }).catch((e) => res.status(401).send());
};

module.exports = {authenticate};