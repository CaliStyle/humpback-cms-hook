'use strict';

//var assert = require('assert');
var request = require('supertest');

describe('Category::', function () {
	it ('should create category', function (done){
     
      var agent = request.agent(sails.hooks.http.app);
      agent
        .post('/api/category')
        .send({
            name: 'all',
        })
        .expect(201, function (err, res) {

          if (err) {
            return done(err);
          }
          console.log(res.body);
          //route2 = res.body;
          //console.log(route2);
          //assert.equal(res.body.slug, 'hello-world-1');
          done();

        });
    });
});