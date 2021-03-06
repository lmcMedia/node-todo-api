const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

// create user ids for seed users
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

// Seed DATA for testing users (we are not hitting the db)
const users = [{
  _id: userOneId ,
  email: 'chris@example.com',
  password: 'user1pass',
  tokens: [{
    access: 'auth',
    // JWT_SECRET located in the config.json file outside of repo
    token: jwt.sign({_id:userOneId, access:'auth'}, process.env.JWT_SECRET).toString(),
  }]
  }, {
    _id: userTwoId,
    email: 'test@example.com',
    password: 'user2pass',
    tokens: [{
      access: 'auth',
      // JWT_SECRET located in the config.json file outside of repo
      token: jwt.sign({_id:userTwoId, access:'auth'}, process.env.JWT_SECRET).toString(),
    }]
}]

// Seed DATA for testing todos (we are not hitting the db)
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

// populate with many todos (Todo.remove({}) removes all records first)
const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

// populate with users (User.remove({}) removes all records first)
const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save(); // returns promise
    let userTwo = new User(users[1]).save(); // returns promise

    // wait for Promises to finish, then do something
    return Promise.all([userOne, userTwo]).then(() => done());
  });
};

module.exports = {todos, populateTodos, users, populateUsers};
