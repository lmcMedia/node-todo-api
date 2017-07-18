const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

// 10 = number of rounds (longer algorithms with larger number)
// the bigger the number the longer it takes which prevents brute force attempts
// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash)
//   });
// });

var hashedPassword = '$2a$10$bkKIgud.NYEMat3KcMA0.OJyYrE9W862aSFtfovcaHH3ybnq3EI9i';

bcrypt.compare('password', hashedPassword, (err, res) => {
  if (!err) console.log(res);
});


// using JSON Web Tokens
// var data = {
//   id: 10
// };

// // takes 2 params, the data and the SALT secret
// var token = jwt.sign(data, '123abc')
// console.log(token);
//
// // takes 2 params, the data and the SALT secret
// var decoded = jwt.verify(token, '123abc');
// console.log(decoded);


// TO MANUALLY HASH AND SALT PASSWORDS YOU DO BELOW:

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
//  var data = {
//    id: 4
//  };
//
//  var token = {
//    data,
//    hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
//  }
//
//  // a hacker could change the data to 5, then re-hash and trick us
//  // into changing the data because the hash would match the data
//  // To prevent this trickery, we are going to SALT the HASH
//  // SALTING is when you add a random value to the end of something
//  // so that it cannot be guessed: in the above example: + 'somesecret'
//
// // LETS PRETEND WE HACK THAT data
// // someone changes the token and hash (but they dont know the SALT)
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed, dont trust!');
// }
