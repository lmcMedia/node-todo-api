const expect = require('expect');
const request = require('supertest');

// ES6 destructuring
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// can also do like this without destructuring
//var app = require('./../server').app;

// lets us run code before each test case
beforeEach((done) => {
  // fake remove all items from Todo database for testing
  // before any tests are run
  Todo.remove({}).then(() => done());
});

describe('Routes', () => {
  describe('HTTP Endpoints', () => {

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
            // return stops the function execution
            return done(err); // pass the error to done so the test ends and fails
          }

          // retrieve all records and make some assertions
          // (the BeforeEach method empties out db so todos.length assumption of 1 is correct)
          Todo.find().then((todos) => {
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
            expect(todos.length).toBe(0);
            done();
          }).catch((e) => done(e));
        })
      });
    });
  });
});
