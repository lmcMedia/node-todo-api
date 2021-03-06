const expect = require('expect');
const request = require('supertest');

// ES6 destructuring
const {app} = require('./../server');
// can also do like this without destructuring
//var app = require('./../server').app;
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {ObjectID} = require('mongodb');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

// lets us run code before each test case
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('Routes', () => {
  describe('HTTP Endpoints', () => {
    // POST ================================================
    describe('POST /todos', () => {
      // asyncronous call so make sure to include 'done'
      // TEST FOR CREATING A NEW TODO
      it('should create a new todo', (done) => {
        let text = 'Test Todo text';

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token) // used for authentication token
        .send({text}) // must use send when using post
        .expect(200)
        .expect((res) => {
          expect(res.body.text).toBe(text); // the text in the var above
        })
        .end((err, res) => {
          // handle errors from above
          if (err) {
            return done(err); // pass the error to done so the test ends and fails
          }

          // retrieve all records and make some assertions
          // (the BeforeEach method empties out db so todos.length assumption of 1 is correct)
          Todo.find({text}).then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((e) => done(e));
        });
      });

      // TEST INVALID DATA WAS SENT
      it('should not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token) // used for authentication token
        .send({}) // send with no data
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);

          // get the todos back and use as param
          Todo.find().then((todos) => {
            expect(todos.length).toBe(2); // from const todos at top
            done();
          }).catch((e) => done(e));
        });
      });
    });

    // GET ================================================
    describe('GET /todos', () => {
      it('should get all todos', (done) => {
          // supertest request
          request(app)
          .get('/todos')
          .set('x-auth', users[0].tokens[0].token) // used for authentication token
          .expect(200)
          .expect((res) => {
            expect(res.body.todos.length).toBe(1); // only 1 record in seed data
          })
          .end(done);
      });
    });

    // GET /todos/:id  =======================================
    describe('GET /todos/:id', () => {
      it('should return todo doc', (done) => {
        request(app)
          .get(`/todos/${todos[0]._id.toHexString()}`)
          .set('x-auth', users[0].tokens[0].token) // authenticates user
          .expect(200)
          .expect((res) => {
            // called todo in the function so we target the body of todo here
            expect(res.body.todo.text).toBe(todos[0].text);
          })
          .end(done);
      });

      it('should not return todo doc created by other user', (done) => {
        request(app)
          .get(`/todos/${todos[1]._id.toHexString()}`) // grab 2nd users id
          .set('x-auth', users[0].tokens[0].token) // authenticate 1st user
          .expect(404)
          .end(done);
      });

      it('should return 404 if todo not found', (done) => {
        // make sure you get a 404 back
        // real object id calling its toHexString method
        let id = new ObjectID().toHexString();
        request(app)
          .get(`/todos/${id}`)
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done);
      });

      it('should return 404 for non-object ids', (done) => {
        request(app)
          .get('/todos/123abc')
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done);
      })
    });

    // DELETE /todos/:id  =======================================
    describe('DELETE /todos/:id', () => {
      it('should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();
        request(app)
          .delete(`/todos/${hexId}`)
          .set('x-auth', users[1].tokens[0].token) // authenticated as 2nd user same as hexId
          .expect(200)
          .expect((res) => {
            expect(res.body.todo._id).toBe(hexId)
          })
          .end((err, res) => {
            if (err) return done(err);

            // query db using findById toNotExist
            Todo.findById(hexId).then((todo) => {
              expect(todo).toNotExist();
              done();
          }).catch((err) => done(err));
        });
      });

      it('should NOT remove a todo from different user', (done) => {
        let hexId = todos[0]._id.toHexString();
        request(app)
          .delete(`/todos/${hexId}`)
          .set('x-auth', users[1].tokens[0].token) // authenticated as 2nd user diff than hexId
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);

            // query db using findById toNotExist
            Todo.findById(hexId).then((todo) => {
              expect(todo).toExist(); // deletion shouldnt happen
              done();
          }).catch((err) => done(err));
        });
      });

      it('should return a 404 if todo not found', (done) => {
        let id = new ObjectID().toHexString(); // create new id not in db
        request(app)
          .delete(`/todos/${id}`)
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end(done);
      });

      it('should return a 404 if ObjectID is invalid', (done) => {
        let id = new ObjectID().toHexString(); // create new id not in db
        request(app)
          .delete(`/todos/123abc`)
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end(done);
      });
    });

    // PATCH /todos/:id  =======================================
    describe('PATCH /todos/:id', () => {
      it('should update the todo', (done) => {
        let id = todos[0]._id.toHexString();
        let text = 'Test Todo text';

        request(app)
          .patch(`/todos/${id}`)
          .set('x-auth', users[0].tokens[0].token) // authenticated as 1st user same
          .send({
            completed: true,
            text
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
          })
          .end(done);
      });

      it('should not update the todo created by another user', (done) => {
        let id = todos[0]._id.toHexString();
        let text = 'Test Todo text';

        request(app)
          .patch(`/todos/${id}`)
          .set('x-auth', users[1].tokens[0].token) // authenticated as 2nd user diff
          .send({
            completed: true,
            text
          })
          .expect(404)
          .end(done);
      });

      it('should clear completedAt when todo is not completed', (done) => {
        let id = todos[1]._id.toHexString();
        let text = 'Something Different for 2';

        request(app)
          .patch(`/todos/${id}`)
          .set('x-auth', users[1].tokens[0].token) // authenticated as 2nd user same
          .send({
            completed: false,
            text
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            // if completed false, no completedAt value should exist
            expect(res.body.todo.completedAt).toNotExist();
          })
          .end(done);
      });
    });

    // GET /users/me  =======================================
    describe('GET /users/me', () => {
      it('should return user if authenticated', (done) => {
        request(app)
          .get('/users/me')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
          })
          .end(done);
      });

      it('should return 401 if not authenticated', (done) => {
        request(app)
          .get('/users/me')
          .expect(401)
          .expect((res) => {
            expect(res.body).toEqual({}); // empty object with no data
          })
          .end(done);
      });
    });

    // USER SIGN UP TESTS
    describe('POST /users', () => {
      it('should create a user', (done) => {
        let email = 'example@example.com';
        let password = '123mnb!'

        request(app)
          .post('/users')
          .send({email, password})
          .expect(200)
          .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
          })
          .end((err) => {
            if (err) return done(err);
            // check if the user exists after created
            User.findOne({email}).then((user) => {
              expect(user).toExist();
              // expect pw to be hashed and not the value above
              expect(user.password).toNotBe(password);
              done();
            }).catch((e) => done(e));
          });
      });

      it('should return validation errors if request invalid', (done) => {
        request(app)
          .post('/users')
          .send({
            email: 'bademail.com',
            password: '12345' // less than 6 digits as defined in User
          })
          .expect(400)
          .end(done);
      })

      it('should not create user if email in use', (done) => {
        request(app)
          .post('/users')
          .send({
            email: users[0].email,   // using seed email that already exists
            password: users[0].password
          })
          .expect(400)
          .end(done);
      });
    });

    // POST /users/login  =======================================
    describe('POST /users/login', () => {
      it('should login user and return auth token', (done) => {
        request(app)
          .post('/users/login')
          .send({ // send seed data
            email: users[1].email,
            password: users[1].password
          })
          .expect(200)
          .expect((res) => {
            expect(res.headers['x-auth']).toExist();
          })
          .end((err, res) => {
            if (err) return done(err);
            User.findById(users[1]._id).then((user) => {
              expect(user.tokens[1]).toInclude({
                access: 'auth',
                token: res.headers['x-auth']
              });
              done();
            }).catch((e) => done(e));
          });
      });

      it('should reject invalid login', (done) => {
        request(app)
          .post('/users/login')
          .send({
            email: users[1].email,
            password: users[1].password + 'blah'
          })
          .expect(400)
          .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
          })
          .end((err, res) => {
            if (err) return done(err);
            User.findById(users[1]._id).then((user) => {
              expect(user.tokens.length).toBe(1); // seed data contains 1 token
              done();
            }).catch((e) => done(e));
          });
      });
    });

    // DELETE /users/me/token  =======================================
    describe('DELETE /users/me/token', () => {
      it('should remove auth token on logout', (done) => {
        request(app)
          .delete('/users/me/token')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            User.findById(users[0]._id).then((user) => {
              expect(user.tokens.length).toBe(0);
              done();
            }).catch((e) => done(e));
        });
      });
    });

  }); // end HTTP Endpoints
}); // end routes
