'use strict';
const RequestModel = require('./request')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tour extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tour.hasMany(models.Request)
    }
  };
  Tour.init(
    {
      request_id: {
          allowNull: false,
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
      },
      tour_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,    
      },
      request_type: {
          type: DataTypes.STRING(20),
          allowNull: false,
      },
      dropoff_code: {
          type: DataTypes.STRING(20),
          allowNull: false,
      },
      // reason: {
      //     type: DataTypes.STRING,
      //     allowNull: true,
      // },
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
      modelName: 'Tour',
      tableName: 'tour_details',
      underscored: true,
    }
  );

  return Tour;
};