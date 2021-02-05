'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('tour_details', 'reason',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }, {after: 'dropoff_code'}
        );
        return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('tour_details', 'reason')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
};
