const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Category = require("./category");
const User = require("./user");

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['categoryId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['type']
    },
    {
      fields: ['userId', 'date']
    },
    {
      fields: ['userId', 'categoryId']
    }
  ]
});

module.exports = Transaction;
