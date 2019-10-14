describe('Test admin application', () => {
  const baseurl = Cypress.env('adminUrl');
  const pass = 'admin';
  const user = 'admin';
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

    it('hould respond with 401 with wrong username', () => {
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
    const client = {
      name: 'a-client',
      config: {},
      contact: {owner: {name: '', phone: '', email: ''}}
    };

    const request = (method, endpoint, body) =>
      cy.request({
        url: `${baseurl}${endpoint}`,
        method: method,
        auth: {
          user,
          pass
        },
        body
      });
    const getClients = () => request('GET', '/clients').its('body');
    const addClient = client => request('POST', '/clients', client);

    const updateClient = (clientId, client) =>
      request('PUT', `/clients/${clientId}`, client).its('body');
    const getClient = clientId =>
      request('GET', `/clients/${clientId}`).its('body');
    const deleteClient = client => request('DELETE', `/clients/${client.id}`);
    const reset = () => getClients().each(deleteClient);

    beforeEach(() => {
      reset();
    });
    it('should respond with empty body', () => {
      getClients().should('deep.equal', []);
    });

    it('should create a client', async () => {
      const {body} = await addClient(client).should(
        'have.all.keys',
        'id',
        'secret'
      );
      getClient(body.id)
        .its('body')
        .should('have.all.keys', 'name', 'config', 'contacts')
        .its('name')
        .should('equal', body.name);
    });

    it('should update a client', async done => {
      const {body} = await addClient(client);
      const updatedClient = {...client, name: 'an updated client'};
      updateClient(body.id, updatedClient);
      getClient(body.id)
        .its('name')
        .should('equal', updatedClient.name)
        .then(() => done());
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
});
