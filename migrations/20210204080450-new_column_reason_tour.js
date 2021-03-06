'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('delivery_requests', 'reason',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }, {after: 'status'}
        );
        return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('delivery_requests', 'reason')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
};
