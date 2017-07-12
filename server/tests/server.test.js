const expect = require('expect');
const request = require('supertest');

// ES6 destructuring
const {app} = require('./../server');
// can also do like this without destructuring
//var app = require('./../server').app;
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');

// for testing
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo'
}];

// lets us run code before each test case
beforeEach((done) => {
  // remove all items from Todo database for testing before any tests are run
  //Todo.remove({}).then(() => done());

  // insert many
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('Routes', () => {
  describe('HTTP Endpoints', () => {
    // POST ================================================
    describe('POST /todos', () => {
      // asyncronous call so make sure to include 'done'
      // TEST FOR CREATING A NEW TODO
      it('should create a new todo', (done) => {
        var text = 'Test Todo text';

        request(app)
        .post('/todos')
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
          .expect(200)
          .expect((res) => {
            expect(res.body.todos.length).toBe(2);
          })
          .end(done);
      });
    });

    // GET /todos/:id  =======================================
    describe('GET /todos/:id', () => {
      it('should return todo doc', (done) => {
        request(app)
          .get(`/todos/${todos[0]._id.toHexString()}`)
          .expect(200)
          .expect((res) => {
            // called todo in the function so we target the body of todo here
            expect(res.body.todo.text).toBe(todos[0].text);
          })
          .end(done);
      });

      it('should return a 404 if todo not found', (done) => {
        // make sure you get a 404 back
        // real object id calling its toHexString method
        let id = new ObjectID().toHexString();
        request(app)
          .get(`/todos/${id}`)
          .expect(404)
          .end(done);
      });

      it('should return 404 for non-object ids', (done) => {
        request(app)
          .get('/todos/123abc')
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

      it('should return a 404 if todo not found', (done) => {
        let id = new ObjectID().toHexString(); // create new id not in db
        request(app)
          .delete(`/todos/${id}`)
          .expect(404)
          .end(done);
      });

      it('should return a 404 if ObjectID is invalid', (done) => {
        let id = new ObjectID().toHexString(); // create new id not in db
        request(app)
          .delete(`/todos/123abc`)
          .expect(404)
          .end(done);
      });
    });
  });
});
