var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/TodoApp');
mongoose.connect(
  'mongodb://test-user:testing@ds153652.mlab.com:53652/node-todo-api' || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
