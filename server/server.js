// body-parse lets us send JSON to the server
var express = require('express');
var bodyParser = require('body-parser');

// ES6 destructured references (returned results populated into {} vars)
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

// config Middleware (when using 3rd party Middleware we just access something)
// the return value of bodyParser.json() is a function that we need to give to Express
// now we can send JSON to Express
app.use(bodyParser.json());

// resource creation
app.post('/todos', (req, res) => {
  console.log(req.body);
});

app.listen(3000, () => {
  console.log('Server up on 3000');
})
