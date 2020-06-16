describe('Test admin application', () => {
  const baseurl = Cypress.env('adminUrl');
  const pass = 'admin';
  const user = 'admin';

  const client = {
    name: 'a-client',
    config: {},
    contact: {owner: {name: '', phone: '', email: ''}},
    enabled: true
  };

  const request = (method, endpoint, body) =>
    cy.request({
      url: `${baseurl}${endpoint}`,
      method: method,
      auth: {
        user,
        pass
      },
      body,
      failOnStatusCode: false
    });
  const getClients = () => request('GET', '/clients').its('body');
  const addClient = client => request('POST', '/clients', client);

  const updateClient = (clientId, client) =>
    request('PUT', `/clients/${clientId}`, client).its('body');
  const getClient = clientId =>
    request('GET', `/clients/${clientId}`).its('body');
  const deleteClient = client => request('DELETE', `/clients/${client.id}`);
  const getToken = (client, user) =>
    request('POST', `/clients/token/${client.id}`, user);
  const reset = () => getClients().each(deleteClient);

  beforeEach(() => {
    reset();
  });

  describe('auth', function() {
    it('should respond with 200 on homepage without credentials', () => {
      cy.request({url: baseurl})
        .its('status')
        .should('equal', 200);
    });

    it('should respond with 401 on other pages without credentials', () => {
      cy.request({url: `${baseurl}/foo`, failOnStatusCode: false})
        .its('status')
        .should('equal', 401);
    });

    it('should respond with 401 with wrong username', () => {
      cy.request({
        url: `${baseurl}/clients`,
        failOnStatusCode: false,
        auth: {
          user: 'wrong',
          pass
        }
      })
        .its('status')
        .should('equal', 401);
    });
    it('should respond with 401 with wrong password', () => {
      cy.request({
        url: `${baseurl}/clients`,
        failOnStatusCode: false,
        auth: {
          user,
          pass: 'wrong'
        }
      })
        .its('status')
        .should('equal', 401);
    });
    it('should respond with 200 with correct credentials', () => {
      cy.request({
        url: `${baseurl}/clients`,
        auth: {
          user,
          pass
        }
      })
        .its('status')
        .should('equal', 200);
    });
  });

  describe('clients', function() {
    it('should respond with empty body', () => {
      getClients().should('deep.equal', []);
    });

    it('should create a client', () => {
      addClient(client)
        .its('body')
        .then(res => {
          getClient(res.id).then(clientRes => {
            cy.wrap(clientRes)
              .its('name')
              .should('equal', res.name);
            cy.wrap(clientRes)
              .its('enabled')
              .should('equal', true);
          });
        });
    });

    it('should update a client', () => {
      addClient(client)
        .its('body')
        .then(res => {
          const updatedClient = {
            ...client,
            name: 'an updated client',
            enabled: false
          };
          updateClient(res.id, updatedClient);
          getClient(res.id)
            .its('name')
            .should('equal', updatedClient.name);
          getClient(res.id)
            .its('enabled')
            .should('equal', false);
        });
    });

    it('should delete a client', () => {
      addClient(client)
        .its('body')
        .then(res => {
          getClients().should('have.length', 1);
          deleteClient(res)
            .its('status')
            .should('equal', 200);
          getClients().should('have.length', 0);
        });
    });
    it('should show a list of clients', () => {
      addClient(client);
      addClient({...client, name: 'client 2'});
      getClients()
        .should('have.length', 2)
        .each(c => expect(['client 2', client.name]).to.contain(c.name));
    });
  });
  describe('request token through admin token endpoint /clients/token/:clientId', () => {
    it('Should provide token for anonumous user', () => {
      addClient(client)
        .its('body')
        .then(res => {
          getToken(res, {username: '@', password: '@'})
            .its('body')
            .should(
              'have.all.keys',
              'token_type',
              'access_token',
              'expires_in'
            );
        });
    });
    it('Should provide token for authenticated user', () => {
      addClient(client)
        .its('body')
        .then(res => {
          getToken(res, {username: '0102033690@790900', password: '0000'})
            .its('body')
            .should(
              'have.all.keys',
              'token_type',
              'access_token',
              'expires_in'
            );
        });
    });
    it('Should fail to provide token for invalid user', () => {
      addClient(client)
        .its('body')
        .then(res => {
          getToken(res, {username: '0102033690@790900', password: 'wrong'})
            .its('body.error_description')
            .should('equal', 'User credentials are invalid');
        });
    });
    it('Should provide token for user without password', () => {
      addClient(client)
        .its('body')
        .then(res => {
          getToken(res, {username: 'some_valid_user'})
            .its('body')
            .should(
              'have.all.keys',
              'token_type',
              'access_token',
              'expires_in'
            );
        });
    });
  });
});
