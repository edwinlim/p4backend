'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'pwsalt',
        {
          type: Sequelize.STRING,
          allowNull: false,
        }, {after: 'email_address'}
        );
        return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'pwsalt')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
};
