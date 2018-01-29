'use strict';

module.exports = {
  up: function (queryInterface) {
    return queryInterface.sequelize.query(
      'ALTER TABLE tokens DROP CONSTRAINT "tokens_clientId_fkey", ADD CONSTRAINT "tokens_clientId_fkey" foreign key ("clientId") references clients (id) ON DELETE CASCADE'
    );
  },

  down: function (queryInterface) {
    return queryInterface.sequelize.query(
      'ALTER TABLE tokens DROP CONSTRAINT "tokens_clientId_fkey", ADD CONSTRAINT "tokens_clientId_fkey" foreign key ("clientId") references clients (id)'
    );
  }
};
