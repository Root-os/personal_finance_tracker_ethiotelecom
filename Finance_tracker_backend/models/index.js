const { sequelize } = require("../config/db");
const User = require("./user");
const Category = require("./category");
const Transaction = require("./transaction");
const RefreshToken = require("./refreshToken");

// User <> category
User.hasMany(Category, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Category.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });

// User <> transaction
User.hasMany(Transaction, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Transaction.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });

// Category <> transaction
Category.hasMany(Transaction, { foreignKey: "categoryId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Transaction.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE", onUpdate: "CASCADE" });

// User <> refresh tokens
User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = {
  sequelize,
  User,
  Category,
  Transaction,
  RefreshToken,
};
