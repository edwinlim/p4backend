'use strict';
const driver = require('./driver')
const Request = require('./request')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      // define association here
      // User.hasMany(models.Driver)
        // , {
        // foreignKey: 'id',
        // as: 'driver_details',
        // onDelete: 'CASCADE'
      // }


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
      pwsalt:{
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
      user_lat:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_long:{
        type: DataTypes.STRING,
        allowNull: true,
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
      timestamps: false,
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true
    }
  );

    return User;
};