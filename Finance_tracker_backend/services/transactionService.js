const { Transaction, Category, sequelize } = require("../models");
const { Op } = require("sequelize");

const transactionService = {
  async createTransaction(transactionData, userId) {
    const { categoryId, amount, type, date, description } = transactionData;

    // Verify category belongs to user
    const category = await Category.findOne({
      where: { id: categoryId, userId }
    });

    if (!category) {
      throw new Error("Category not found or does not belong to you");
    }

    const transaction = await Transaction.create({
      userId,
      categoryId,
      amount,
      type,
      date,
      description: description?.trim() || null,
    });

    return await this.getTransactionById(transaction.id, userId);
  },

  async getTransactions(userId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      type,
      startDate,
      endDate,
      search
    } = filters;

    const whereClause = { userId };

    // Apply filters
    if (categoryId) whereClause.categoryId = categoryId;
    if (type) whereClause.type = type;
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  },

  async getTransactionById(transactionId, userId) {
    const transaction = await Transaction.findOne({
      where: { id: transactionId, userId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return transaction;
  },

  async updateTransaction(transactionId, updateData, userId) {
    const transaction = await Transaction.findOne({
      where: { id: transactionId, userId }
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // If categoryId is being updated, verify it belongs to user
    if (updateData.categoryId) {
      const category = await Category.findOne({
        where: { id: updateData.categoryId, userId }
      });

      if (!category) {
        throw new Error("Category not found or does not belong to you");
      }
    }

    await transaction.update(updateData);

    return await this.getTransactionById(transactionId, userId);
  },

  async deleteTransaction(transactionId, userId) {
    const transaction = await Transaction.findOne({
      where: { id: transactionId, userId }
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await transaction.destroy();
    return { message: "Transaction deleted successfully" };
  },

  async getTransactionSummary(userId, filters = {}) {
    const { startDate, endDate, categoryId } = filters;

    const whereClause = { userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }
    if (categoryId) whereClause.categoryId = categoryId;

    const summary = await Transaction.findAll({
      where: whereClause,
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const result = {
      totalIncome: 0,
      totalExpense: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    summary.forEach(item => {
      if (item.type === 'income') {
        result.totalIncome = parseFloat(item.total) || 0;
        result.incomeCount = parseInt(item.count) || 0;
      } else {
        result.totalExpense = parseFloat(item.total) || 0;
        result.expenseCount = parseInt(item.count) || 0;
      }
    });

    result.balance = result.totalIncome - result.totalExpense;

    return result;
  }
};

module.exports = transactionService;
