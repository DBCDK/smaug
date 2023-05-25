'use strict';
//import Redis from 'ioredis';
import redis from 'redis';
import {log} from './utils';
import {
  createApp,
  createAdminApp,
  createOAuthApp,
  createConfigurationApp
} from './expressapp';
import models, {migrate} from './models';
import config from './config/config';

if (config.datasources && config.datasources.postgres.uri) {
  config.datasources.postgres.models = models(config.datasources.postgres);
  migrate(config.datasources.postgres.models.sequelize);
}

if (config.datasources && config.datasources.redis.uri) {
  config.datasources.redis.redisClient = redis.createClient(config.datasources.redis.uri);
}

if (config.mock_externals.borchk) {
  require('../fixtures/fixtures');
}

function loadBackend(storeName, storeConfig) {
  const storeBackend = storeConfig.backend || 'inmemory';
  storeConfig.config.backend = config.datasources[storeBackend];
  const store = require('./oauth/' +
    storeName.toLowerCase() +
    '/' +
    storeBackend).default;
  store.requiredOptions().forEach(requiredOption => {
    if (typeof storeConfig.config[requiredOption] === 'undefined') {
      throw new Error(
        'Missing option for ' + storeConfig.backend + ': ' + requiredOption
      );
    }
  });
  return new store(loadedStores, storeConfig.config);
}

const storesToLoad = [
  'agencyStore',
  'clientStore',
  'configStore',
  'tokenStore'
];

var loadedStores = {};

// load generic stores
storesToLoad.forEach(storeName => {
  const storeNameInConfig = storeName.toLowerCase();
  loadedStores[storeName] = loadBackend(storeName, config[storeNameInConfig]);
});

var userStores = {};

// load auth backends
Object.keys(config.auth).forEach(authBackendName => {
  const storeConfig = config.auth[authBackendName];
  userStores[authBackendName] = loadBackend('userstore', storeConfig);
});

var apps = [];

if (config.ports.oAuth !== config.ports.configuration) {
  apps.push({
    express: createOAuthApp(config),
    port: config.ports.oAuth,
    name: 'auth'
  });
  apps.push({
    express: createConfigurationApp(config),
    port: config.ports.configuration,
    name: 'config'
  });
} else {
  // Since config.ports.oAuth and config.ports.configuration can be set to the same port, but might be different from $port,
  // it might be wrong to listen on $port when not in split mode.
  apps.push({express: createApp(config), port: config.ports.oAuth});
}

if (typeof config.ports.admin !== 'undefined') {
  apps.push({
    express: createAdminApp(config),
    port: config.ports.admin,
    name: 'admin'
  });
}

apps.forEach(app => {
  app.express.set('stores', loadedStores);
  app.express.set('auth', userStores);
  app.express.listen(app.port, () => {
    var description = '';
    if (typeof app.name !== 'undefined') {
      description = ' (' + app.name + ')';
    }
    log.info('Started Smaug' + description + ' on port ' + app.port);
  });
});
