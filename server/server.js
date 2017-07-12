// body-parse lets us send JSON to the server
const express     = require('express');
const bodyParser  = require('body-parser');
// prep for Heroku
// (*create start script and "engines" to establish which version of Node to run on Heroku inside package.json )
const port        = process.env.PORT || 3000;

// ES6 destructured references (returned results populated into {} vars)
const {mongoose}  = require('./db/mongoose');
const {ObjectID}  = require('mongodb');
const {Todo}      = require('./models/todo');
const {User}      = require('./models/user');


const app = express();

// config Middleware
// the return value of bodyParser.json() is a function that we need to give to Express
// now we can send JSON to Express
app.use(bodyParser.json());

// POST =============================================================
// this gets the POST from POSTMAN's Body raw data in JSON format
// This is an HTTP Endpoint for the Todo REST API
app.post('/todos', (req, res) => {
  // create instance of Mongoose Model Todo
  var todo = new Todo({
    text: req.body.text
  });

  // Save the data to MongoDB Todo that was POSTed from /todos url
  // Sends data (document record) back to the user who hit the API
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => res.status(400).send(e));
});

// GET ALL TODOS =====================================================
app.get('/todos', (req, res) => {
   // get a list of todos back
   Todo.find().then((todos) => {
     // send back the full list (we send back an object since we can add to the object if we want to later)
     res.send({todos});
   }, (e) => {
     res.status(400).send(e);
   });
});

// GET WITH ID ========================================================
// creates id variable in the todos/ url like todos/123456
// so the API call containing the Todo id will receive back data
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  // use Mongoose ObjectID to validate id
  if (!ObjectID.isValid(id))
    return res.status(404).send();

  // find the Todo by the id in the url
  // res.send sends back either the todo object or an error
  Todo.findById(id).then((todo) => {
    if (!todo) return res.status(404).send('Todo id cannot be found.');
    res.send({todo});
  }).catch((err) => res.send('CAST ERROR - invalid id entered'));
})

// SERVER ========================================================
app.listen(port, () => {
  console.log(`Server up on ${port}` );
});

// exports the express app created when var app = express();
module.exports = {app};
