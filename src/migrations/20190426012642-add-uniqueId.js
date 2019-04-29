'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('tokens', 'uniqueId', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  // eslint-disable-next-line no-unused-vars
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('tokens', 'uniqueId');
  }
};
