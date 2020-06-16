'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('clients', 'enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },
  // eslint-disable-next-line no-unused-vars
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('clients', 'enabled');
  }
};
