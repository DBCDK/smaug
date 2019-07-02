'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Chance from 'chance';
import request from 'supertest';
import {createAdminApp, filterClient, clientWithId} from '../expressapp';
import AllowAllUserStore from '../oauth/userstore/allow-all';
import DenyAllUserStore from '../oauth/userstore/deny-all';
import TokenStore from '../oauth/tokenstore/inmemory';
import ClientStore from '../oauth/clientstore/inmemory';
import UserStore from '../oauth/userstore/inmemory';
import {userEncode} from '../utils';

chai.use(chaiAsPromised);
chai.should();

function validateClient(client) {
  ['id', 'name'].forEach(property => {
    client.should.have.property(property);
  });
}

describe('admin app', function() {
  var app = null;
  var chance = null;
  var appConfig = null;
  var admin_username = null;
  var admin_password = null;
  var clientId = null;
  var clientSecret = null;
  var client = null;
  var user;
  var username;
  var password;

  before(function() {
    chance = new Chance();
    admin_username = chance.word({length: 10});
    admin_password = chance.string();
    client = {
      name: 'a-client',
      config: {},
      contact: {owner: {name: '', phone: '', email: ''}}
    };
    user = {id: chance.word({length: 10}), libraryId: '123456'};
    username = userEncode(user.libraryId, user.id);
    password = chance.string();

    appConfig = {
      culr: {},
      mock_externals: {culr: '1'},
      admin: {
        users: {}
      }
    };

    appConfig.admin.users[admin_username] = admin_password;
    var stores = {};
    stores.clientStore = new ClientStore(stores, {
      clients: {
        'c0ba685e-2130-4e24-b4e9-4a903fe71ada': {
          name: 'duckDevLTD',
          secret: 'duck'
        }
      }
    });
    stores.tokenStore = new TokenStore(stores);
    stores.userStore = new UserStore(stores);
    stores.userStore.storeUser(username, password);
    app = createAdminApp(appConfig);
    app.set('stores', stores);
    app.set('auth', {
      default: stores.userStore,
      allowAll: new AllowAllUserStore(),
      denyAll: new DenyAllUserStore()
    });
  });

  describe('auth', function() {
    it('should respond with 200 on homepage without credentials', function(done) {
      request(app)
        .get('/')
        .expect(200, done);
    });

    it('should respond with 401 on other pages without credentials', function(done) {
      request(app)
        .get('/foo')
        .expect(401, done);
    });

    it('should respond with 401 with wrong username', function(done) {
      request(app)
        .get('/clients')
        .auth(admin_username + 'foo', admin_password)
        .expect(401, done);
    });

    it('should respond with 401 with wrong password', function(done) {
      request(app)
        .get('/clients')
        .auth(admin_username, admin_password + 'foo')
        .expect(401, done);
    });

    it('should respond with 200 with correct credentials', function(done) {
      request(app)
        .get('/clients')
        .auth(admin_username, admin_password)
        .expect(200, done);
    });
  });

  describe('clients', function() {
    it('should create a client', function(done) {
      request(app)
        .post('/clients')
        .auth(admin_username, admin_password)
        .type('json')
        .send(JSON.stringify(client))
        .expect(res => {
          clientId = res.body.id;
          clientSecret = res.body.secret;
          res.body.should.deep.equal(
            Object.assign({}, client, {id: clientId, secret: clientSecret})
          );
        })
        .expect(200, done);
    });

    it('should update a client', function(done) {
      client.name = 'an updated client';
      request(app)
        .put('/clients/' + clientId)
        .auth(admin_username, admin_password)
        .type('json')
        .send(JSON.stringify(client))
        .expect(res => {
          res.body.should.deep.equal(
            clientWithId(filterClient(client), clientId)
          );
        })
        .expect(200, done);
    });

    it('should retrieve a client', function(done) {
      request(app)
        .get('/clients/' + clientId)
        .auth(admin_username, admin_password)
        .expect(res => {
          res.body.should.have.property('id', clientId);
          res.body.should.have.property('name', client.name);
          res.body.should.deep.equal(
            clientWithId(filterClient(client), clientId)
          );
        })
        .expect(200, done);
    });

    it('should retrieve a client token', function(done) {
      request(app)
        .post('/clients/token/' + clientId)
        .auth(admin_username, admin_password)
        .type('json')
        .send(
          JSON.stringify({
            grant_type: 'password',
            username: '@',
            password: '@'
          })
        )
        .expect(res => {
          res.body.should.have.property('token_type');
          res.body.should.have.property('access_token');
          res.body.should.have.property('expires_in');
        })
        .expect(200, done);
    });

    it('should retrieve an authenticated client token', function(done) {
      request(app)
        .post('/clients/token/' + clientId)
        .auth(admin_username, admin_password)
        .type('json')
        .send(
          JSON.stringify({
            grant_type: 'password',
            username: username,
            password: password
          })
        )
        .expect(res => {
          res.body.should.have.property('token_type');
          res.body.should.have.property('access_token');
          res.body.should.have.property('expires_in');
        })
        .expect(200, done);
    });

    it('should return formatted error when using wrong credentials', function(done) {
      request(app)
        .post('/clients/token/' + clientId)
        .auth(admin_username, admin_password)
        .type('json')
        .send(
          JSON.stringify({
            grant_type: 'password',
            username: username + 'foo',
            password: password
          })
        )
        .expect(res => {
          res.body.should.have.property('code', 400);
          res.body.should.have.property('error', 'invalid_client');
        })
        .expect(400, done);
    });

    it('should use allowAll UserStore, when password is not set', function(done) {
      request(app)
        .post('/clients/token/' + clientId)
        .auth(admin_username, admin_password)
        .type('json')
        .send(
          JSON.stringify({
            grant_type: 'password',
            username: username
          })
        )
        .expect(res => {
          res.body.should.have.property('token_type');
          res.body.should.have.property('access_token');
          res.body.should.have.property('expires_in');
        })
        .expect(200, done);
    });

    it('should delete a client', function(done) {
      request(app)
        .delete('/clients/' + clientId)
        .auth(admin_username, admin_password)
        .expect(200, done);
    });

    it('should list all clients', function(done) {
      request(app)
        .get('/clients')
        .auth(admin_username, admin_password)
        .expect(res => {
          res.body.should.have.lengthOf(1);
          res.body.forEach(returnedClient => {
            validateClient(returnedClient);
          });
        })
        .expect(200, done);
    });
  });
});
