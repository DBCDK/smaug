'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import request from 'supertest';
import createapp from '../expressapp';
import TokenStore from '../oauth/tokenstore/inmemory';
import UserStore from '../oauth/userstore/inmemory';
import ConfigStore from '../oauth/configstore/static';

chai.use(chaiAsPromised);
chai.should();

describe('web app', function () {
  var app = null;
  var chance = null;
  var clientId = null;
  var clientSecret = null;
  var config = null;
  var bearerToken = null;

  before(function () {
    chance = new Chance();
    clientId = chance.word({length: 10});
    clientSecret = chance.string();
    config = {a: 'config'};

    var tokenStore = new TokenStore();
    var userStore = new UserStore();
    var configStore = new ConfigStore(config);
    tokenStore.storeClient(clientId, clientSecret);
    app = createapp(tokenStore, userStore, configStore);
  });

  it('should respond with 200 on /', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('should return a token when logging in with client-id and -secret', function (done) {
    request(app)
      .post('/oauth/token')
      .type('form')
      .send({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
      .expect(function(res) {
        var token = JSON.parse(res.text);
        token.should.have.property('access_token').with.length(40);
        token.should.have.property('expires_in');
        token.token_type.should.equal('bearer');
        bearerToken = token.access_token;
      })
      .expect(200, done);
  });

  it('should return configuration when queried for it with a token', function(done) {
    request(app)
      .get('/configuration?token=' + bearerToken)
      .expect(function(res) {
        var returnedConfig = JSON.parse(res.text);
        returnedConfig.should.deep.equal(config);
      })
      .expect(200, done);
  });
});