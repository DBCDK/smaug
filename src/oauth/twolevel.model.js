'use strict';

import {log} from '../utils';
import contains from 'lodash';
import Throttler from '../throttle/throttle.js';

/**
 * @file Model used by the OAuth2 Server for Resource-Owner
 */

const throttler = new Throttler();

export class Model {
  constructor(tokenStore, userStore) {
    this.tokenStore = tokenStore;
    this.userStore = userStore;
  }

  getAccessToken(bearerToken, callback) {
    this.tokenStore.getAccessToken(bearerToken)
      .then((token) => {
        log.info('model.getAccessToken success', {token: token});
        callback(null, token);
      })
      .catch((err) => {
        log.info('model.getAccessToken failure', {bearerToken: bearerToken, err: err});
        callback(err, null);
      });
  }

  saveAccessToken (accessToken, clientId, expires, user, callback) {
    this.tokenStore.storeAccessToken(accessToken, clientId, expires, user)
      .then(callback())
      .catch((err) => {
        throw err;
      });
  }

  getClient (clientId, clientSecret, callback) {
    this.tokenStore.getClient(clientId, clientSecret)
      .then(() => {
        // if found then return clientid else return false
        log.info('model.getClient success', {clientId: clientId});
        callback(null, {clientId: clientId});
      })
      .catch((err) => {
        log.info('model.getClient failure', {clientId: clientId, err: err});
        callback(err, false);
      });
  }

  grantTypeAllowed (clientId, grantType, callback) {
    // All clients should be allowed to used password and client_credentials
    if (contains(['password', 'client_credentials'], grantType)) {
      callback(null, true);
    }
    else {
      callback(null, false);
    }
  }

  getUser (username, password, callback) {
    const borchk = this.userStore.getUser(username, password);
    borchk
      .then((user) => {
        if (user) {
          callback(null, user);
        }
        else {
          // if borchk fails
          // register username
          throttler.registerAuthFailure(username);
          // and return a non-informative auth error
          callback(new Error('authentication error'), null);
        }
      })
      .catch((err) => {
        // other borchk errors
        callback(err, null);
      });
  }

  getUserFromClient(clientId, clientSecret, callback) {
    let user = {id: 'anonymous'};
    callback(null, user);
  }
}

export default Model;
