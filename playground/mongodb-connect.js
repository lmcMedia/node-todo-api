//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // same as above but ES6 destructured

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    console.log(err);
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  // add data
  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert Todo.');
  //   }

  //   // result.ops has all documents (rows/records)
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  // db.collection('Users').insertOne({
  //   name: 'Chris',
  //   age: '30',
  //   location: 'Japan'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert User');
  //   }
  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  // });

  db.close();
});

// var obj = new ObjectID(); // dynamic object id's generated like this
// console.log(obj);

//object destructuring in ES6 (pull out properties from object creating variables)
// var user = {name: 'Chris', age: 30};
// var {name} = user; // destructured
// console.log(name);
