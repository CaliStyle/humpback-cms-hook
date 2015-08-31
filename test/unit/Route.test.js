'use strict';

//var assert = require('assert');
var request = require('supertest');

describe('Route::', function () {

  describe('http request', function () {

    it ('Should Complete the Test', function (done) {

      request(sails.hooks.http.app)
          .get('/hello')
          .expect(200)
          .end(function(err) {
            done(err);
          });

    });
  });

});