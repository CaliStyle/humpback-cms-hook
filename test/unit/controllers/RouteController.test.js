'use strict';

var assert = require('assert');
var request = require('supertest');

describe('RouteController::', function () {

  describe('http request', function () {
    
    var routes, route, route2, category;

    it ('should Complete the GET Test', function (done) {

      request(sails.hooks.http.app)
        .get('/hello')
        .expect(200)
        .end(function(err) {
          done(err);
        });
    });

    it ('should Complete the GET Test and return 404', function (done) {

      request(sails.hooks.http.app)
        .get('/hello.jpg')
        .expect(404)
        .end(function(err) {
          done(err);
        });
    });

    it ('should find all the Routes, return 200, and all routes', function (done){

      var agent = request.agent(sails.hooks.http.app);

      agent
        .get('/api/route')
        .expect(200, function (err, res) {

          if (err) {
            return done(err);
          }

          routes = res.body;
          for(var i in routes){
            if(routes[i].uri === '/hello'){
              route = routes[i];
            }
          }
          //console.log('HELLO ROUTE:', routeId);
          done();
        });
    });
    
    it ('should update /hello, return 200, and make slug "hello-world"', function (done){
      
      route.title = 'Hello World';

      var agent = request.agent(sails.hooks.http.app);
      agent
        .put('/api/route/' + route.id)
        .send(route)
        .expect(200, function (err, res) {

          if (err) {
            return done(err);
          }

          assert.equal(res.body.slug, 'hello-world');
          done();

        });
    });

    it ('should update /hello, return 200, and still make slug "hello-world"', function (done){
      
      route.title = 'Hello World';

      var agent = request.agent(sails.hooks.http.app);
      agent
        .put('/api/route/' + route.id)
        .send(route)
        .expect(200, function (err, res) {

          if (err) {
            return done(err);
          }
          
          assert.equal(res.body.slug, 'hello-world');
          done();

        });
    });

    it ('should create /hello2, return 200, and make slug "hello-world-1"', function (done){
      
      var id = new Buffer('get:/hello2').toString('base64');

      var agent = request.agent(sails.hooks.http.app);
      agent
        .post('/api/route')
        .send({
            id: id,
            address: 'get /hello2',
            target: {view: 'hello.index'},
            title: 'Hello World'
        })
        .expect(201, function (err, res) {

          if (err) {
            return done(err);
          }
          route2 = res.body;
          //console.log(route2);
          assert.equal(res.body.slug, 'hello-world-1');
          done();

        });
    });

    it ('should update /hello2, return 200, and still make slug "hello-world-1"', function (done){
      
      route2.title = 'Hello World';

      var agent = request.agent(sails.hooks.http.app);
      agent
        .put('/api/route/' + route2.id)
        .send(route2)
        .expect(200, function (err, res) {

          if (err) {
            return done(err);
          }
          
          assert.equal(res.body.slug, 'hello-world-1');
          done();

        });
    });

    it ('should create /hello3, return 200, and make slug "hello-world-2"', function (done){
      
      var id = new Buffer('get:/hello2').toString('base64');

      var agent = request.agent(sails.hooks.http.app);
      agent
        .post('/api/route')
        .send({
            id: id,
            address: 'get /hello3',
            target: {view: 'hello.index'},
            title: 'Hello World'
        })
        .expect(201, function (err, res) {

          if (err) {
            return done(err);
          }
          route2 = res.body;
          //console.log(route2);
          assert.equal(res.body.slug, 'hello-world-2');
          done();

        });
    });

    it ('should create category "hello"', function (done){
     
      var agent = request.agent(sails.hooks.http.app);
      agent
        .post('/api/category')
        .send({
            name: 'hello',
        })
        .expect(201, function (err, res) {

          if (err) {
            return done(err);
          }
          //console.log(res.body);
          category = res.body;
          //console.log(route2);
          //assert.equal(res.body.slug, 'hello-world-1');
          done();

        });
    });

    it ('should add route to category', function (done){

      //console.log('/api/category/' + category.id + '/routes/' + route.id);

      var agent = request.agent(sails.hooks.http.app);
        
        agent
          .post('/api/category/' + category.id + '/routes/' + route.id)
          .send({})
          .expect(200, function (err, res) {

            if (err) {
              return done(err);
            }
            //route2 = res.body;
            console.log(res.body);
            
            done();

          });
    });
  });
});