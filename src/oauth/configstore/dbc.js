'use strict';

import lodash from 'lodash';
import InmemoryConfigStore from './inmemory';

function defaultsDeep(dest, defaults) {
  const skipDeepDefaults = ['attributes', 'identityProviders'];
  if (!Array.isArray(dest) && typeof dest === 'object') {
    Object.keys(defaults).forEach(defaultKey => {
      if (!dest[defaultKey]) {
        dest[defaultKey] = defaults[defaultKey];
      } else {
        if (skipDeepDefaults.indexOf(defaultKey) === -1) {
          dest[defaultKey] = defaultsDeep(
            dest[defaultKey],
            defaults[defaultKey]
          );
        }
      }
    });
  }

  return dest;
}

export default class DbcConfigStore extends InmemoryConfigStore {
  get(user, client) {
    return super
      .get(user, client)
      .then(unAugmentedConfig => {
        const config = lodash.cloneDeep(unAugmentedConfig);

        if (typeof config.search === 'undefined') {
          config.search = {};
        }

        config.search.agency = user.libraryId;

        return config;
      })
      .then(config => {
        return new Promise((resolve, reject) => {
          // eslint-disable-line no-unused-vars
          return this.stores.agencyStore
            .get(user.libraryId)
            .then(fetchedAgency => {
              const overrideSearchProfile =
                typeof (fetchedAgency.search || {}).profile !== 'undefined';
              const overrideDdbCmsApi =
                typeof (fetchedAgency.ddbcms || {}).api !== 'undefined';
              const overrideDdbCmsPassword =
                typeof (fetchedAgency.ddbcms || {}).password !== 'undefined';

              if (overrideSearchProfile) {
                config.search.profile = fetchedAgency.search.profile;
              }

              if (overrideDdbCmsApi && overrideDdbCmsPassword) {
                config.services.ddbcmsapi = fetchedAgency.ddbcms.api;
                config.app.ddbcmsapipassword = fetchedAgency.ddbcms.password;
              } else if (overrideDdbCmsApi || overrideDdbCmsPassword) {
                return reject(
                  new Error(
                    'both (or neither) agency.ddbcms.api and agency.ddbcms.password must be set'
                  )
                );
              }

              return resolve(config);
            })
            .catch(err => {
              // eslint-disable-line no-unused-vars
              // since no options are required to be set, the config can just be returned.
              resolve(config);
            });
        });
      })
      .then(config => {
        return new Promise((resolve, reject) => {
          return this.stores.clientStore
            .get(client.id)
            .then(fetchedClient => {
              const clientConfig = Object.assign({}, fetchedClient.config);

              const overrideAgency =
                typeof (clientConfig.search || {}).agency !== 'undefined';
              const overrideProfile =
                typeof (clientConfig.search || {}).profile !== 'undefined';

              if (overrideAgency ? !overrideProfile : overrideProfile) {
                // XOR
                return reject(
                  new Error(
                    'both (or neither) client.search.agency and client.search.profile must be set'
                  )
                );
              }

              return resolve(defaultsDeep(clientConfig, config));
            })
            .catch(err => {
              reject(err);
            });
        });
      });
  }
}
