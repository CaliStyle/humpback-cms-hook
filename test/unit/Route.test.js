'use strict';

//var assert = require('assert');
var request = require('supertest');

describe('Route::', function () {

  describe('http request', function () {

    it ('Should Complete the GET /hello Test', function (done) {

      request(sails.hooks.http.app)
          .get('/hello')
          .expect(200)
          .end(function(err) {
            done(err);
          });

    });

    it ('Should Complete the GET /hello.jpg Test and return 404', function (done) {

      request(sails.hooks.http.app)
          .get('/hello.jpg')
          .expect(404)
          .end(function(err) {
            done(err);
          });

    });

    it ('Should Complete the Test and return 200', function (done) {

      request(sails.hooks.http.app)
          .get('/api/route')
          .expect(200)
          .end(function(err) {
            done(err);
          });

    });

  });

});