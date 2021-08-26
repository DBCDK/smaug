describe('Oauth flow', () => {
  const userEncode = (userId, libraryId) => `${userId}@${libraryId}`;
  const baseurl = Cypress.env('oAuthUrl');
  const baseConfigUrl = Cypress.env('configUrl');

  const clients = {
    invalid: {user: 'user', pass: 'wrong'},
    allowAll: {user: 'user', pass: 'wrong', auth: 'allowAll'}
  };
  const users = {
    anonymous: {
      grant_type: 'password',
      username: userEncode('', ''),
      password: userEncode('', '')
    },
    library: {
      grant_type: 'password',
      username: userEncode('', 790900),
      password: userEncode('', 790900)
    },
    isil: {
      grant_type: 'password',
      username: userEncode('', 'DK-790900'),
      password: userEncode('', 'DK-790900')
    },
    authenticated: {
      grant_type: 'password',
      username: userEncode('0102033690', '790900'),
      password: '0000'
    },
    invalid: {
      grant_type: 'password',
      username: userEncode('0102033690', '790900'),
      password: 'wrong'
    }
  };
  before(() => {
    [
      {
        name: 'regular'
      },
      {name: 'disabled', enabled: false}
    ].forEach(client => {
      cy.createClient({
        name: client.name,
        config: {},
        contact: {owner: {name: '', phone: '', email: ''}},
        enabled: client.enabled
      }).then(res => {
        clients[client.name] = {user: res.id, pass: res.secret};
      });
    });
  });

  const getToken = (creds, auth, url = baseurl) =>
    cy.request({
      method: 'POST',
      url: `${url}/oauth/token`,
      auth,
      body: creds,
      failOnStatusCode: false,
      form: true
    });

  const getConfiguration = token =>
    cy.request({
      url: `${baseConfigUrl}/configuration`,
      qs: {
        token
      },
      failOnStatusCode: false
    });

  describe('oAuth endpoints', () => {
    it('should respond with 200 on /', () => {
      cy.request(baseurl)
        .its('status')
        .should('equal', 200);
    });
    it('should fail when logging in with client credentials', () => {
      getToken({
        grant_type: 'client_credentials',
        username: '',
        password: clients.regular.secret
      }).then(res => {
        cy.wrap(res)
          .its('status')
          .should('equal', 400);
        cy.wrap(res)
          .its('body.error_description')
          .should('equal', 'Invalid or missing grant_type parameter');
      });
    });

    it('should return an error when requesting a token with invalid client credentials', () => {
      getToken(users.anonymous, clients.invalid).then(res => {
        cy.wrap(res)
          .its('status')
          .should('equal', 400);
        cy.wrap(res)
          .its('body.error_description')
          .should('equal', 'Client credentials are invalid');
      });
    });
    it('should return a token when logging in as anonymous user at library', () => {
      getToken(users.library, clients.regular)
        .its('body')
        .should('have.all.keys', 'token_type', 'access_token', 'expires_in');
    });
    it('should return a token when logging in as anonymous user at library with ISIL-number', () => {
      getToken(users.isil, clients.regular)
        .its('body')
        .should('have.all.keys', 'token_type', 'access_token', 'expires_in');
    });
    it('should return a token when logging in as anonymous', () => {
      getToken(users.anonymous, clients.regular)
        .its('body')
        .should('have.all.keys', 'token_type', 'access_token', 'expires_in');
    });
    it('should return a token when logging in with password', () => {
      getToken(users.authenticated, clients.regular)
        .its('body')
        .should('have.all.keys', 'token_type', 'access_token', 'expires_in');
    });

    it('should not return a token when given an invalid password', () => {
      getToken(users.invalid, clients.regular).then(res => {
        cy.wrap(res)
          .its('status')
          .should('equal', 400);
        cy.wrap(res)
          .its('body.error_description')
          .should('equal', 'User credentials are invalid');
      });
    });
    it('should not return a token when client is disabled', () => {
      getToken(users.anonymous, clients.disabled).then(res => {
        cy.wrap(res)
          .its('status')
          .should('equal', 403);
        cy.wrap(res)
          .its('body.error_description')
          .should('equal', 'Client is disabled');
      });
    });
  });

  describe('Configuration endpoints', () => {
    it('should respond with 200 on /', () => {
      cy.request(baseConfigUrl)
        .its('status')
        .should('equal', 200);
    });

    it('should fail when using invalid token', () => {
      getConfiguration('invalid_token')
        .its('status')
        .should('equal', 404);
    });

    it('should return configuration when queried for it with a token', () => {
      getToken(users.authenticated, clients.regular)
        .its('body')
        .then(res => {
          getConfiguration(res.access_token)
            .then(clientRes => console.log(clientRes))
            .its('body')
            .should(
              'contain.keys',
              'app',
              'attributes',
              'identityProviders',
              'netpunkt',
              'services',
              'user'
            )
            .its('user')
            .should('deep.equal', {
              agency: '790900',
              id: '0102033690',
              isil: 'DK-790900',
              libraryId: '790900',
              salt: 'xxx',
              uniqueId: null,
              pin: '0000'
            });
        });
    });

    it('should not return configuration when client is disabled', () => {
      // client needs to be enabled at first, to get access token
      const client = {
        name: 'some client',
        config: {},
        contact: {owner: {name: '', phone: '', email: ''}},
        enabled: true
      };
      cy.createClient(client).then(res => {
        const clientCredentials = {user: res.id, pass: res.secret};
        getToken(users.anonymous, clientCredentials)
          .its('body')
          .then(res => {
            // now we got the access token, so disable client
            cy.updateClient(clientCredentials.user, {
              ...client,
              enabled: false
            }).then(() => {
              // and then fail fetching the configuration
              getConfiguration(res.access_token).then(clientRes => {
                cy.wrap(clientRes)
                  .its('status')
                  .should('equal', 403);
                cy.wrap(clientRes)
                  .its('body.error_description')
                  .should('equal', 'Client is disabled');
              });
            });
          });
      });
    });
  });
});
