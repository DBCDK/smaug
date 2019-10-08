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
    it('should create a client', () => {
      const client = {
        name: 'a-client',
        config: {},
        contact: {owner: {name: '', phone: '', email: ''}}
      };
      cy.request({
        url: `${baseurl}/clients`,
        method: 'POST',
        auth: {
          user,
          pass
        },
        body: JSON.stringify(client)
      }).should(r => {
        console.log(r);
      });

      /*      request(app)
        .post('/clients')
        .auth(admin_username, admin_password)
        .type('json')
        .send(JSON.stringify(client))
        .expect(res => {
          clientId = res.body.id;
          clientSecret = res.body.secret;
          res.body.should.deep.equal(
            Object.assign({}, client, {id: clientId, secret: clientSecret})
          );
        })
        .expect(200, done);*/
    });
  });
});
