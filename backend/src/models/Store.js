const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Store extends Model {}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: 'Store name must be between 20 and 60 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Store email already in use',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [1, 400],
          msg: 'Store address cannot exceed 400 characters',
        },
      },
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: {
        msg: 'This owner is already assigned to a store',
      },
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Store',
    tableName: 'stores',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['owner_id'],
      },
      {
        fields: ['name'],
      },
      {
        fields: ['address'],
      },
    ],
  }
);

module.exports = Store;
