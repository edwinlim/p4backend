'use strict';
const User = require('./user')

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Request extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        // static associate(models) {
        //     // define association here
        //     Request.belongsTo(models.User, {
        //       foreignKey: 'sender_id',
        //       onDelete: 'CASCADE'
        //     })
        //   }
    };

    Request.init(
        {
            id: {
                allowNull: false,
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            sender_id: {
                allowNull: false,
                type: DataTypes.BIGINT.UNSIGNED,
            },
            receiver_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            receiver_block_num: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            receiver_road_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            receiver_floor: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            receiver_unit_number: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            receiver_poscode: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            receiver_country: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Singapore',
            },
            receiver_contact: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            receiver_email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            receiver_lat: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            receiver_long: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            item_description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            item_qty: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            special_instructions: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pickup_code: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            driver_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            reason: {
                type: DataTypes.STRING(20),
                allowNull: true,
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
            modelName: 'Request',
            tableName: "delivery_requests",
            underscored: true,
        }
    );

    return Request;
};