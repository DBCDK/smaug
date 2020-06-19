// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('createClient', client => {
  return cy
    .request({
      url: `${Cypress.env('adminUrl')}/clients`,
      method: 'POST',
      auth: {
        user: 'admin',
        pass: 'admin'
      },
      body: client
    })
    .then(({body}) => body);
});

Cypress.Commands.add('updateClient', (clientId, client) => {
  return cy
    .request({
      url: `${Cypress.env('adminUrl')}/clients/${clientId}`,
      method: 'PUT',
      auth: {
        user: 'admin',
        pass: 'admin'
      },
      body: client
    })
    .then(({body}) => body);
});
