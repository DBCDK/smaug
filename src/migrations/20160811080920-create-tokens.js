'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('tokens', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      userId: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      expires: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('tokens');
  }
};
