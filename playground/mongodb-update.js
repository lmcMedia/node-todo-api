//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // same as above but ES6 destructured

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    console.log(err);
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  // findOneAndUpdate
  // http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#findOneAndUpdate
  // db.collection('Todos').findOneAndUpdate(
  //   {_id: new ObjectID("595a3e8d4018bb317366286a")},
  //   {$set: {completed: true}}, //https://docs.mongodb.com/manual/reference/operator/update/
  //   {returnOriginal: false})
  //   .then((result) => {
  //     console.log(result);
  // });

  // update multiple fields
  db.collection('Users').findOneAndUpdate(
    {_id: new ObjectID('5959a5995e64812408605985')},
    {$set: {name: 'Chris'}, $inc: {age: 1}},
    {returnOriginal: false})
    .then((result) => {
      console.log(result);
    });

  //db.close();
});
