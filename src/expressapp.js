'use strict';

import express from 'express';
import createError from 'http-errors';
import OAuth2Server from 'oauth2-server';
import bodyParser from 'body-parser';
import basicAuth from 'basic-auth';
import Redis from 'ioredis';
import moment from 'moment';
import _ from 'lodash';
import url from 'url';
import {log} from './utils';
import Model from './oauth/twolevel.model.js';
import adminGrant from './oauth/adminGrant';
import * as culr from './lib/culr/culr.client';
import {userEncode, userDecode} from './utils';

/**
 *
 * @param config
 * @returns {Express}
 */
function createBasicApp(config) {
  culr.setConfig(config);
  var app = express();
  app.set('config', config);

  const {storePasswordsInRedisCluster = {}} = app.get('config');
  if (storePasswordsInRedisCluster.uri) {
    app.set(
      'storePasswordsInRedisClient',
      new Redis.Cluster([storePasswordsInRedisCluster.uri], {
        keyPrefix: storePasswordsInRedisCluster.prefix || 'user:'
      })
    );
  }

  app.disable('x-powered-by');
  app.set('json spaces', 2);
  app.enable('trust proxy');

  app.use((req, res, next) => {
    var timeStart = moment();
    res.logData = {};

    res.on('finish', () => {
      var timeEnd = moment();
      log.info(
        null,
        Object.assign(res.logData || {}, {
          type: 'accessLog',
          request: {
            method: req.method,
            path: req.path,
            query: req.query,
            hostname: req.hostname,
            remoteAddress: req.ip
          },
          response: {status: res.statusCode},
          time: {
            start: timeStart,
            end: timeEnd,
            taken: timeEnd.diff(timeStart)
          }
        })
      );
    });

    next();
  });

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.get('/', function(req, res) {
    res.send(
      'Smaug authentication system. Documentation: <a href="https://github.com/DBCDK/smaug#readme">https://github.com/DBCDK/smaug#readme</a>'
    );
  });

  app.get('/health', (req, res) => {
    var result = {ok: {}};
    var stores = app.get('stores');

    var storePromises = Object.keys(stores).map(storeId => {
      var tStart = moment();
      // eslint-disable-next-line no-unused-vars
      return new Promise((resolve, reject) => {
        stores[storeId]
          .ping()
          .then(() => {
            resolve({responseTime: moment().diff(tStart), result: 'ok'});
          })
          .catch(err => {
            resolve({responseTime: moment().diff(tStart), result: err});
          });
      });
    });

    Promise.all(storePromises).then(results => {
      _.zip(Object.keys(stores), results).forEach(zipElem => {
        let [storeId, status] = zipElem;
        if (status.result instanceof Error) {
          if (typeof result.errors === 'undefined') {
            result.errors = {};
          }
          result.errors[storeId] = {
            name: status.result.name,
            msg: status.result.message,
            stacktrace: status.result.stack,
            responseTime: status.responseTime
          };
        } else {
          result.ok[storeId] = {responseTime: status.responseTime};
        }
      });
      if (Object.keys(result.errors || {}).length > 0) {
        res.status(500);
      }
      res.logData.health = result;
      res.json(result);
    });
  });

  return app;
}

/*
 * Middleware that rejects the request
 * if client is disabled.
 *
 * It will look up the client based on either
 * clientId given as param, a token,
 * or client credentials in the request.
 *
 * Note that if the client can't be found,
 * the request is passed on to let another
 * middleware handle the invalid request
 */

function ensureClientEnabled(req, res, next) {
  const clientId = req.params.clientId;
  const bearerToken = getTokenAsString(req.query.token);
  const clientCredentials = basicAuth(req);

  const handleClient = clientid => {
    return req.app
      .get('stores')
      .clientStore.get(clientid)
      .then(client => {
        if (client.enabled === false) {
          return res
            .status(403)
            .json({error_description: 'Client is disabled'});
        }
        next();
      })
      .catch(() => next());
  };
  if (clientId) {
    return handleClient(clientId);
  } else if (bearerToken) {
    return req.app
      .get('stores')
      .tokenStore.getAccessToken(bearerToken)
      .then(tokenInfo => handleClient(tokenInfo.clientId))
      .catch(() => {
        next();
      });
  } else if (clientCredentials) {
    return handleClient(clientCredentials.name);
  }
  next();
}

/** If more than one token is set, use the first and ignore the rest
 *
 * @param token
 * @returns {string}
 */
function getTokenAsString(token) {
    return (typeof token === 'object') ? Object.values(token)[0] : token;
}

/**
 *
 * @param config
 * @returns {Express}
 */
export function createConfigurationApp(config) {
  const app = createBasicApp(config);

  app.get('/configuration', ensureClientEnabled, (req, res, next) => {
    const bearerToken = getTokenAsString(req.query.token);
    res.logData.token = bearerToken;

    app
      .get('stores')
      .tokenStore.getAccessToken(bearerToken)
      .then(tokenInfo => {
        let user = Object.assign(userDecode(tokenInfo.userId));
        user.agency = user.libraryId;
        user.isil =
          user.libraryId.indexOf('DK-') === 0
            ? user.libraryId
            : `DK-${user.libraryId}`;
        user.uniqueId = tokenInfo.uniqueId;
        const client = {id: tokenInfo.clientId};
        return app
          .get('stores')
          .configStore.get(user, client)
          .then(userConfig => {
            // merge user with existing config, to get hardcoded things like 'salt'
            user = Object.assign(userConfig.user || {}, user);
            userConfig.expires = tokenInfo.expires;
            userConfig.app = Object.assign(userConfig.app || {}, {
              clientId: tokenInfo.clientId
            });

            const storePasswordsInRedisClient = app.get(
              'storePasswordsInRedisClient'
            );
            if (typeof storePasswordsInRedisClient !== 'undefined') {
              storePasswordsInRedisClient.get(
                tokenInfo.userId,
                (redisErr, redisRes) => {
                  if (redisErr) {
                    return next(
                      createError(500, "I'm still a teapot", {
                        wrappedError: redisErr
                      })
                    );
                  }

                  const insecureUser = Object.assign({}, user, {
                    pin: redisRes
                  });
                  res.json(Object.assign({}, userConfig, {user: insecureUser}));
                }
              );
            } else {
              // success
              res.json(Object.assign({}, userConfig, {user: user}));
            }
          })
          .catch(err => {
            log.error('Error creating configuration', {
              error: {message: err.message, stacktrace: err.stack}
            });
            return next(
              createError(500, 'Error creating configuration', {
                wrappedError: err
              })
            );
          });
      })
      .catch(err => {
        log.error('Error creating configuration', {
          error: {message: err.message, stacktrace: err.stack}
        });
        return next(createError(404, 'Token not found', {wrappedError: err}));
      });
  });

  // error handler
  app.use((err, req, res, next) => {
    log.error(err.message, {
      error: {message: err.message, stacktrace: err.stack}
    });
    next();
  });

  return app;
}

/**
 *
 * @param req
 * @param res
 * @param next
 */
function handleRevokeToken(req, res, next) {
  const token = req.params.token;
  res.logData.token = token;

  req.app
    .get('stores')
    .tokenStore.revokeToken(token)
    .then(response => res.json(response))
    .catch(error => next(new Error(error)));
}

/**
 *
 * @param req
 * @param res
 * @param next
 */
function handleRevokeTokensForUser(req, res, next) {
  const tokenStore = req.app.get('stores').tokenStore;
  const token = req.query.token;
  res.logData.token = token;

  tokenStore
    .getAccessToken(token)
    .then(tokenInfo => {
      return tokenStore.clearAccessTokensForUser(tokenInfo.userId);
    })
    .then(response => res.json(response))
    .catch(error => next(new Error(error)));
}

/**
 *
 * @param config
 * @returns {Express}
 */
export function createOAuthApp(config = {}) {
  var app = createBasicApp(config);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
  });

  app.oauth = OAuth2Server({
    model: new Model(app),
    grants: ['password'],
    debug: true,
    accessTokenLifetime: config.tokenExpiration || 60 * 60 * 24 * 30 // default to 30 days
  });

  // Add implicit libraryId to anonymous user without libraryId, and change the password from accordingly.
  // The password must be equal to the username for an anonymous request, and userEncode(libraryId, null) returns the proper anonymous username/password for this
  app.use('/oauth/token', (req, res, next) => {
    if (req.body.username === userEncode(null, null)) {
      if (typeof config.defaultLibraryId === 'undefined') {
        log.error('No default library id. Set config.defaultLibraryId');
      } else {
        req.body.username += config.defaultLibraryId;
        if (req.body.password === userEncode(null, null)) {
          req.body.password += config.defaultLibraryId;
        }
      }
    }

    if (typeof req.body.username !== 'undefined') {
      if (req.body.username.startsWith('@DK-')) {
        req.body.username = req.body.username.replace('DK-', '');
        req.body.password = String(req.body.password).replace('DK-', '');
      }
      const clientCredentials = basicAuth(req) || {};
      const user = userDecode(req.body.username);
      req.body.username = url.format({
        protocol: clientCredentials.name,
        host: user.libraryId,
        auth: user.id,
        slashes: true
      });
    }

    next();
  });
  app.post('/oauth/token', ensureClientEnabled, app.oauth.grant());
  app.delete('/oauth/token/:token', handleRevokeToken);
  app.delete('/oauth/tokens', handleRevokeTokensForUser);
  app.use(app.oauth.errorHandler());

  return app;
}

/**
 *
 * @param config
 * @returns {Express}
 */
export function createApp(config = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.use(createConfigurationApp(config));
  app.use(createOAuthApp(config));

  return app;
}

/**
 *
 * @param client
 * @returns {*}
 */
export function filterClient(client) {
  const filteredClient = Object.assign({}, client);
  delete filteredClient.secret;
  return filteredClient;
}

/**
 *
 * @param clients
 * @returns {*}
 */
export function filterClients(clients) {
  return clients.map(filterClient);
}

/**
 *
 * @param client
 * @param id
 * @returns {any}
 */
export function clientWithId(client, id) {
  return Object.assign({}, client, {id: id});
}

/**
 *
 * @param config
 * @returns {Express}
 */
export function createAdminApp(config = {}) {
  const app = createBasicApp(config);
  app.oauth = OAuth2Server({
    model: new Model(app),
    grants: ['password'],
    debug: true,
    accessTokenLifetime: config.tokenExpiration || 60 * 60 * 24 * 30 // default to 30 days
  });

  app.set('config', config);
  app.use((req, res, next) => {
    const credentials = basicAuth(req) || {};
    if (
      _.every([
        typeof credentials.name === 'string',
        typeof credentials.pass === 'string'
      ])
    ) {
      const users = (app.get('config').admin || {}).users || {};
      if (users[credentials.name] === credentials.pass) {
        res.logData.user = credentials.name;
        return next();
      }
    }
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.sendStatus(401);
  });

  const clientEndpoint = express.Router();
  const configEndpoint = express.Router();

  clientEndpoint.use((req, res, next) => {
    next();
  });

  clientEndpoint
    .route('/')
    .get((req, res) => {
      // list clients
      app
        .get('stores')
        .clientStore.getAll()
        .then(filterClients)
        .then(clients => {
          res.json(clients);
        })
        .catch(err => {
          res.json({err: err});
        });
    })
    .post((req, res) => {
      // create client
      const client = {
        name: req.body.name,
        config: req.body.config,
        contact: req.body.contact,
        enabled: req.body.enabled
      };

      app
        .get('stores')
        .clientStore.create(client)
        .then(persistedClient => {
          res.json(persistedClient);
        })
        .catch(err => {
          res.json({err: err});
        });
    });

  clientEndpoint
    .route('/:clientId')
    .get((req, res) => {
      // get client
      app
        .get('stores')
        .clientStore.get(req.params.clientId)
        .then(filterClient)
        .then(client => {
          res.json(client);
        })
        .catch(err => {
          res.json({err: err});
        });
    })
    .put((req, res) => {
      // update client
      const clientId = req.params.clientId;
      const client = {};

      ['name', 'config', 'contact', 'enabled'].forEach(field => {
        if (typeof req.body[field] !== 'undefined') {
          client[field] = req.body[field];
        }
      });
      app
        .get('stores')
        .clientStore.update(clientId, client)
        .then(filterClient)
        .then(persistedClient => {
          res.json(persistedClient);
        })
        .catch(err => {
          res.json({err: err});
        });
    })
    .delete((req, res) => {
      // delete client
      app
        .get('stores')
        .clientStore.delete(req.params.clientId)
        .then(() => {
          res.json({});
        })
        .catch(err => {
          res.json({err: err});
        });
    });
  clientEndpoint
    .route('/token/:clientId')
    .post(ensureClientEnabled, (req, res, next) => {
      if (req.body.username === userEncode(null, null)) {
        if (typeof config.defaultLibraryId === 'undefined') {
          log.error('No default library id. Set config.defaultLibraryId');
        } else {
          req.body.username += config.defaultLibraryId;
          if (req.body.password === userEncode(null, null)) {
            req.body.password += config.defaultLibraryId;
          }
        }
      }
      if (typeof req.body.username !== 'undefined') {
        adminGrant(app, req, res, next);
      } else {
        next();
      }
    });

  configEndpoint.route('/').get((req, res) => {
    const config = Object.assign({}, app.get('config'));

    if (config.datasources.postgres) {
      delete config.datasources.postgres.models;
    }

    if (config.datasources.redis_cluster) {
      delete config.datasources.redis_cluster.redisClient;
    }

    [
      'userstore',
      'agencystore',
      'clientstore',
      'tokenstore',
      'configstore'
    ].forEach(store => {
      delete config[store].config.backend;
    });

    res.json(config);
  });

  app.use('/clients', clientEndpoint);
  app.use('/config', configEndpoint);
  app.use(app.oauth.errorHandler());

  return app;
}

export default createApp;
