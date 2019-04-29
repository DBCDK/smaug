'use strict';

import activedirectory from 'activedirectory';
import {log} from '../../utils';

export default class UserStore {
  static requiredOptions() {
    return [];
  }

  constructor(stores, config = {}) {
    this.ad = new activedirectory(config);
    var configToLog = Object.assign({}, config);
    delete configToLog.password;
    log.info('initialized activedirectory client', configToLog);
  }

  ping() {
    var ad = this.ad;
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-vars
      ad.find('uid=*', (err, results) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  }

  getUser(username, password) {
    var ad = this.ad;
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-vars
      ad.authenticate(username, password, (err, results) => {
        if (err) {
          return resolve(false);
        }

        return resolve({id: username});
      });
    });
  }
}
