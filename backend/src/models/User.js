const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
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
          msg: 'Name must be between 20 and 60 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Email address already in use',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [1, 400],
          msg: 'Address cannot exceed 400 characters',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'),
      allowNull: false,
      defaultValue: 'NORMAL_USER',
      validate: {
        isIn: {
          args: [['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']],
          msg: 'Invalid user role',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
    ],
  }
);

module.exports = User;
