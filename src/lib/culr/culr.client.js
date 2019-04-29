/**
 * @file
 * Client for communicating with the CULR webservice
 */

import {log} from '../../utils';
const soap = require('soap');

let CulrClient = null;
let CONFIG;
let CULR_AUTH_CREDENTIALS;

/**
 * Configures the CULR client
 */
export function setConfig(config) {
  CONFIG = config;
  CULR_AUTH_CREDENTIALS = {
    userIdAut: config.culr && config.culr.userIdAut,
    groupIdAut: config.culr && config.culr.groupIdAut,
    passwordAut: config.culr && config.culr.passwordAut
  };
}

/**
 * Fetches uniqueId (culr Guid) for a user
 *
 * @param userIdValue CPR of the given user
 * @param agencyId
 * @return {Promise}
 */
export async function getUniqueId({userIdValue, agencyId}) {
  let res = await getAccountsByGlobalId({
    userIdValue
  });
  if (res && res.result && res.result.Guid) {
    return res.result.Guid;
  }

  res = await getAccountsByLocalId({
    userIdValue,
    agencyId
  });
  if (res && res.result && res.result.Guid) {
    return res.result.Guid;
  }

  log.error(
    `Culr: uniqueId could not be fetched for userId=${userIdValue} agencyId=${agencyId}`
  );
  return null;
}

/**
 * Invokes the getAccountsByGlobalId CULR method
 *
 * @param userIdValue CPR of the given user
 * @return {Promise}
 */
export async function getAccountsByGlobalId({userIdValue}) {
  if (!CulrClient) {
    await init();
  }
  const params = {
    userCredentials: {
      userIdType: 'CPR',
      userIdValue: userIdValue
    },
    authCredentials: CULR_AUTH_CREDENTIALS
  };

  return new Promise((resolve, reject) => {
    if (!CulrClient) {
      throw new Error('CULR client is not initialised');
    }
    CulrClient.getAccountsByGlobalId(params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Invokes the getAccountsByLocalId CULR method
 *
 * @param userIdValue
 * @param agencyId
 * @returns {Promise}
 */
export async function getAccountsByLocalId({userIdValue, agencyId}) {
  if (!CulrClient) {
    await init();
  }
  const params = {
    userCredentials: {
      agencyId: agencyId,
      userIdValue: userIdValue
    },
    authCredentials: CULR_AUTH_CREDENTIALS
  };

  return new Promise((resolve, reject) => {
    if (!CulrClient) {
      throw new Error('CULR client is not initialised');
    }
    CulrClient.getAccountsByLocalId(params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
/**
 * Initializes the CULR webservice. If MOCK_CULR (CONFIG.mock_externals.culr) is true a mock of the webservice will be
 * created.
 */
function init() {
  return new Promise((resolve, reject) => {
    const options = {
      ignoredNamespaces: {
        namespaces: [],
        override: true
      }
    };

    if (CONFIG.mock_externals && CONFIG.mock_externals.culr) {
      setMockClient();
      resolve(CulrClient);
    } else {
      soap.createClient(CONFIG.culr.uri, options, (err, client) => {
        if (err) {
          log.error('Error when creating CULR client', {error: err});
          reject(err);
          return false;
        }

        client.on('request', request => {
          log.debug('A request was made to CULR', {request: request});
        });

        client.on('response', response => {
          log.debug('A response was received from CULR', {response: response});
        });

        CulrClient = client;
        resolve(CulrClient);
      });
    }
  });
}

function setMockClient() {
  CulrClient = require('./culr.client.mock').CulrMockClient;
}
