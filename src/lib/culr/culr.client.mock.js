/**
 * @file
 * Creates a static mock CULR client
 */

export const CulrMockClient = {
  /**
   * getAccountsByGlobalId mock. If the value of params.userCredentials.userIdValue matches '1234567890' a OK200 response will be
   * returned. Otherwise is a ACCOUNT_DOES_NOT_EXIST response is returned.
   *
   * @param {object} params
   * @param {function} cb
   */
  getAccountsByGlobalId: (params, cb) => {
    const response =
      params.userCredentials.userIdValue === '5555666677' ||
      params.userCredentials.userIdValue === '87654321' ||
      params.userCredentials.userIdValue === 'donald'
        ? OK200()
        : ACCOUNT_DOES_NOT_EXIST();
    cb(null, response);
  },
  getAccountsByLocalId: (params, cb) => {
    const response =
      params.userCredentials.userIdValue === '5555666677' ||
      params.userCredentials.userIdValue === '87654321' ||
      params.userCredentials.userIdValue === 'donald'
        ? OK200()
        : ACCOUNT_DOES_NOT_EXIST();
    cb(null, response);
  }
};

function OK200() {
  return {
    result: {
      Account: [
        {
          provider: '790900',
          userIdType: 'CPR',
          userIdValue: '5555666677'
        },
        {
          provider: '100800',
          userIdType: 'LOCAL-1',
          userIdValue: '456456'
        }
      ],
      MunicipalityNo: '909',
      Guid: 'some-random-curl-id',
      responseStatus: {
        responseCode: 'OK200'
      }
    }
  };
}

function ACCOUNT_DOES_NOT_EXIST() {
  return {
    result: {
      responseStatus: {
        responseCode: 'ACCOUNT_DOES_NOT_EXIST',
        responseMessage: 'Account does not exist'
      }
    }
  };
}
