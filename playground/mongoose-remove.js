const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

Todo.findOneAndRemove({_id:'5965ada0664f7aa6b2feef79'}).then((todo) => {
  
});

// Todo.findByIdAndRemove('5965ada0664f7aa6b2feef79').then((todo) => {
//   console.log(todo);
// });
