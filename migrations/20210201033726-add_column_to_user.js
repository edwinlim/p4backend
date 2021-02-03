'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'user_lat',
        {
          type: Sequelize.STRING,
          allowNull: true,
        });
      await queryInterface.addColumn('users', 'user_long',
        {
          type: Sequelize.STRING,
          allowNull: true,
        })
        return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },  

  down: async (queryInterface) => {
    try {
      await queryInterface.removeColumn('users', 'user_lat')
      await queryInterface.removeColumn('users', 'user_long')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
  
};
