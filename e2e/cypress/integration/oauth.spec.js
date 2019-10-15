describe('Oauth flow', () => {
  const userEncode = (userId, libraryId) => `${userId}@${libraryId}`;
  const baseurl = Cypress.env('oAuthUrl');

  const clients = {
    invalid: {user: 'user', pass: 'wrong'}
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
    }
  };
  before(() => {
    [
      {
        name: 'regular'
      }
    ].forEach(client => {
      cy.createClient({
        name: client.name,
        config: {},
        contact: {owner: {name: '', phone: '', email: ''}}
      }).then(res => {
        clients[client.name] = {user: res.id, pass: res.secret};
      });
    });
  });

  const getToken = (creds, auth) =>
    cy.request({
      method: 'POST',
      url: `${baseurl}/oauth/token`,
      auth,
      body: creds,
      failOnStatusCode: false,
      form: true
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

    it('should not return a token when given an invalid password', () => {});
    it('should pick auth-backend based on the client id (allow all)', () => {});
    it('should pick auth-backend based on the client id (deny all)', () => {});
  });

  describe('Configuration endpoints', () => {
    it('should respond with 200 on /');
    it('should return configuration when queried for it with a token');
  });
});
