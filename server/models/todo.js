var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  // associate a Todo with a specific user
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }
});

module.exports = {Todo};
