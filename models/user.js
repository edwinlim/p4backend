'use strict';
const DriverModel = require('./driver')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Driver, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      })
    }
  };
  User.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_roles: {
        type:DataTypes.STRING,
        allowNull: false,
      },
      email_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      address_block_num: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      road_name: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      floor: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      unit_number: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      poscode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Singapore',
      },
      contact: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, 
    {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true
    }
  );
  return User;
};