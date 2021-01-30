'use strict';
const UserModel = require('./user')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Driver.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      })
    }
  };
  Driver.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      plate_number: {
        type:DataTypes.STRING(20),
        allowNull: false,
      },
      vehicle_type: {
        type:DataTypes.STRING,
        allowNull: false,
      },
      remark: {
        type:DataTypes.STRING,
        allowNull: true,
      },
      availability: {
        type:DataTypes.BOOLEAN,
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
      modelName: 'Driver',
      tableName: "driver_details",
      underscored: true,
    }
  );

  return Driver;
};