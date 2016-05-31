'use strict';

import lodash from 'lodash';
import InmemoryConfigStore from './inmemory';


export default class DbcConfigStore extends InmemoryConfigStore {
  get(user, client) {
    return super.get(user, client)
      .then((unAugmentedConfig) => {
        var config = lodash.cloneDeep(unAugmentedConfig);

        if (typeof config.search === 'undefined') {
          config.search = {};
        }

        config.search.agency = user.libraryId;

        return config;
      })
      .then((config) => {
        return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
          return this.stores.agencyStore.get(user.libraryId)
            .then((fetchedAgency) => {
              var overrideSearchProfile = typeof (fetchedAgency.search || {}).profile !== 'undefined';
              var overrideDdbCmsApi = typeof (fetchedAgency.ddbcms || {}).api !== 'undefined';
              var overrideDdbCmsPassword = typeof (fetchedAgency.ddbcms || {}).password !== 'undefined';

              if (overrideSearchProfile) {
                config.search.profile = fetchedAgency.search.profile;
              }

              if (overrideDdbCmsApi && overrideDdbCmsPassword) {
                config.services.ddbcmsapi = fetchedAgency.ddbcms.api;
                config.app.ddbcmsapipassword = fetchedAgency.ddbcms.password;
              }
              else if (overrideDdbCmsApi || overrideDdbCmsPassword) {
                return reject(new Error('both (or neither) agency.ddbcms.api and agency.ddbcms.password must be set'));
              }

              return resolve(config);
            })
            .catch((err) => { // eslint-disable-line no-unused-vars
              // since no options are required to be set, the config can just be returned.
              resolve(config);
            });
        });
      })
      .then((config) => {
        return new Promise((resolve, reject) => {
          return this.stores.clientStore.get(client.id)
            .then((fetchedClient) => {
              var overrideAgency = typeof (fetchedClient.search || {}).agency !== 'undefined';
              var overrideProfile = typeof (fetchedClient.search || {}).profile !== 'undefined';

              if (overrideAgency && overrideProfile) {
                config.search.agency = fetchedClient.search.agency;
                config.search.profile = fetchedClient.search.profile;
              }
              else if (overrideAgency || overrideProfile) {
                return reject(new Error('both (or neither) client.search.agency and client.search.profile must be set'));
              }

              if (typeof (fetchedClient.search || {}).collectionidentifiers !== 'undefined') {
                config.search.collectionidentifiers = fetchedClient.search.collectionidentifiers;
              }

              return resolve(config);
            })
            .catch((err) => {
              reject(err);
            });
        });
      });
  }
}
