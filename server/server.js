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

// this gets the POST from postman
app.post('/todos', (req, res) => {
  // create instance of Mongoose Model
  var todo = new Todo({
    text: req.body.text
  });

  // Save the data to MongoDB Todo that was POSTed from /todos url
  todo.save().then((doc) => {
    // The Model Todo has the following fields (text, completed, completedAt)
    // in addition, an _id is auto generated, so the record that is sent back
    // to POSTMAN (the api) in this case would contain a record that looks like this:
    // {
    //     "__v": 0,
    //     "text": "This is from Postman", // text that was sent into the /todos url as JSON
    //     "_id": "595c7f2ee6a4d5290cb64495",
    //     "completedAt": null,
    //     "completed": false
    // }
    // response contains the document from the DB with the data above
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.listen(3000, () => {
  console.log('Server up on 3000');
});
