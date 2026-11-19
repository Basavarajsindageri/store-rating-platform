const sequelize = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Associations
User.hasOne(Store, {
  foreignKey: 'owner_id',
  as: 'store',
  onDelete: 'SET NULL',
});

Store.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
  onDelete: 'SET NULL',
});

User.hasMany(Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});

Rating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
});

Store.hasMany(Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});

Rating.belongsTo(Store, {
  foreignKey: 'store_id',
  as: 'store',
  onDelete: 'CASCADE',
});

module.exports = {
  sequelize,
  User,
  Store,
  Rating,
};
