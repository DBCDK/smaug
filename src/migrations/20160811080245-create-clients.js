'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('clients', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      secret: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      contact: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  // eslint-disable-next-line no-unused-vars
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('clients');
  }
};
