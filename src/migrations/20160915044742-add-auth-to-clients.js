'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('clients', 'auth', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  // eslint-disable-next-line no-unused-vars
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('clients', 'auth');
  }
};
