'use strict';

export default class UserStore {
  static requiredOptions() {
    return [];
  }
  // eslint-disable-next-line no-unused-vars
  constructor(stores, config) {}

  ping() {
    return Promise.resolve();
  }
  // eslint-disable-next-line no-unused-vars
  storeUser(username, password) {
    return Promise.resolve();
  }
  // eslint-disable-next-line no-unused-vars
  getUser(username, password) {
    return Promise.resolve(false);
  }
}
