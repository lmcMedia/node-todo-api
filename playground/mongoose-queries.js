const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// User id from RoboMongo
var id = '595ae081dd1de02030e5409f';

User.findById(id).then((user) => {
  if (!user) return console.log('User not found.');
  console.log('Found by Id', JSON.stringify(user, undefined, 2));
}).catch((e) => console.log('CAST ERROR - invalid id entered'));



// // id to use for querying (we will be receiving this as a POST on the API)
// var id = '69640fe6df1ac200c42bf23544';
//
// // use Mongoose's ObjectID to validate id
// if (!ObjectID.isValid(id)) {
//   console.log('ID is not valid');
// }
//
// // Mongoose will take whatever format we enter and convert
// // it for us in the background
// // RETURNS AN ARRAY
// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos);
// });
//
// // RETURNS A DOCUMENT (record object)
// // if document is missing, you will get back null
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo);
// });
//
// Todo.findById(id).then((todo) => {
//   if (!todo) return console.log('Id not found');
//   console.log('Todo by Id', todo);
// }).catch((e) => console.log(e)); // if id has more char when sent by user (cast error)
