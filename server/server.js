require('./config/config');

const _           = require('lodash');
const express     = require('express');
const bodyParser  = require('body-parser');
// prep for Heroku
// (*create start script and "engines" to establish which version of Node to run on Heroku inside package.json )
const port         = process.env.PORT;

// ES6 destructured references (returned results populated into {} vars)
const {mongoose}      = require('./db/mongoose');
const {ObjectID}      = require('mongodb');
const {Todo}          = require('./models/todo');
const {User}          = require('./models/user');
const {authenticate}  = require('./middleware/authenticate');

const app = express();

// body-parse lets us send JSON to Express
// the return value of bodyParser.json() is a function that we need to give to Express
app.use(bodyParser.json());

// ==================================================================
// CRUD for the API
// ==================================================================
// POST (CRUD - Create) =============================================
// this gets the POST from POSTMAN's Body raw data in JSON format
app.post('/todos', authenticate, (req, res) => {
  // create instance of Mongoose Model Todo
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  // Save the data to MongoDB Todo that was POSTed from /todos url
  // Sends data (document record) back to the user who hit the API
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => res.status(400).send(e));
});

// GET ALL TODOS (CRUD - Read) =======================================
app.get('/todos', authenticate, (req, res) => {
   // get a list of todos back from a specific ID. Other users cannot see.
   // other users will not be able to view since this route is authenticated
   Todo.find({_creator: req.user._id}).then((todos) => {
     // send back an object since we can add to the object if we want to later
     res.send({todos});
   }, (e) => {
     res.status(400).send(e);
   });
});

// GET WITH ID (CRUD - Read) ==========================================
// creates id variable in the todos/ url like todos/123456
// so the API call containing the Todo id will receive back data
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // use Mongoose ObjectID to validate id
  if (!ObjectID.isValid(id))
    return res.status(404).send();

  // find the Todo by the id in the url
  // res.send sends back either the todo object or an error
  Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
    if (!todo) return res.status(404).send('Todo id cannot be found.');
    res.send({todo});
  }).catch((err) => res.send('CAST ERROR - invalid id entered'));
});

// PATCH (CRUD - Update) =============================================
app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  // lodash pick sets up which properties on the body can be updated.
  // we dont want users updating or adding properties that arent specified here
  // EXACTLY the same as Laravel's protected $fillable
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id))
    return res.status(404).send('Invalid ID entered');

  // update completedAt property when changes on completed occur
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime(); // returns JS timestamp
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  // update the Todo with authentication
  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if (!todo) return res.status(404).send();
    res.send({todo});
  }).catch((e) => res.status(400).send());
});

// DELETE WITH ID (CRUD - Delete) =====================================
app.delete('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send('Invalid ID entered');

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send('Todo id cannot be found.'); // prevents null
    res.send({todo});
  }).catch((e) => {
    res.status(400).send('Cast Error - invalid id entered');
  });
});


// POST /users ========================================================
app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body); // you can just pass in the whole object
  // the code below is not necessary
  // var user = new User({ email: body.email, password: body.password });

  user.save().then(() => {
    return user.generateAuthToken(); // after this, then is called with the token
  }).then((token) => {
    // send back a header: key/value pair
    // when you prefix a header with x- it is a custom header
    res.header('x-auth', token).send(user);
  }).catch((e) => res.status(400).send(e));
});

// POST /users/login {email, hashed password} ==========================
app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    // create a new token for the user
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// DELETE /users/me/token delete token from currently logged in user ===
// Using authenticate middleware because the token is
// stored in the middleware @ req.token = token;
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  })
});

// PRIVATE ROUTE with middleware defined (needs valid token to access)
// only use authenticate when a token is present
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// SERVER ===============================================================
app.listen(port, () => {
  console.log(`Server up on ${port}` );
});

// exports the express app created when var app = express();
module.exports = {app};
