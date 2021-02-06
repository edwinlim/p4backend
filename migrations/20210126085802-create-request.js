'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('delivery_requests', {
      id: {
        allowNull: false,
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      sender_id: {
        allowNull: false,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      receiver_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      receiver_block_num: {
          type: Sequelize.STRING(10),
          allowNull: false,
      },
      receiver_road_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
      }, 
      receiver_floor: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
      },
      receiver_unit_number: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
      receiver_poscode: {
          type: Sequelize.STRING(10),
          allowNull: false,
      },
      receiver_country: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Singapore',
      },
      receiver_contact: {
          type: Sequelize.STRING(20),
          allowNull: false,
      },
      receiver_email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      receiver_lat: {
          type: Sequelize.STRING,
          allowNull: true,
      },
      receiver_long: {
          type: Sequelize.STRING,
          allowNull: true,
      },
      item_description: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      item_qty: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      special_instructions: {
          type: Sequelize.STRING,
          allowNull: true,
      },
      pickup_code: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
      },
      driver_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
      },
      status: {
          type: Sequelize.STRING(20),
          allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('delivery_requests');
  }
};