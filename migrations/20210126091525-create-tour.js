'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tour_details', {
      request_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.BIGINT.UNSIGNED
      },
      tour_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false, 
      },
      request_type: {
          type: Sequelize.STRING(20),
          allowNull: false,
      },
      dropoff_code: {
          type: Sequelize.STRING(20),
          allowNull: false, 
      },
      createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
      },
      updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tour_details');
  }
};