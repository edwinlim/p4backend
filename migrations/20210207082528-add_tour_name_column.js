'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('tour_details', 'tour_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }, {after: "tour_id" }
      );
        return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('tour_details', 'tour_name')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
};
