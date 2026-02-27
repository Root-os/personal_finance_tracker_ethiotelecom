const { Transaction, Category, User } = require("../models");
const { Op } = require("sequelize");
const { fn, col } = require("sequelize");

const analyticsService = {
  async getMonthlyTrends(userId, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [fn('YEAR', col('Transaction.date')), 'year'],
        [fn('MONTH', col('Transaction.date')), 'month'],
        'type',
        [fn('SUM', col('Transaction.amount')), 'total']
      ],
      group: [
        fn('YEAR', col('Transaction.date')),
        fn('MONTH', col('Transaction.date')),
        'type'
      ],
      order: [
        [fn('YEAR', col('Transaction.date')), 'ASC'],
        [fn('MONTH', col('Transaction.date')), 'ASC']
      ],
      raw: true
    });

    // Format data for frontend
    const formattedData = {};
    monthlyData.forEach(item => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
      if (!formattedData[key]) {
        formattedData[key] = { income: 0, expense: 0 };
      }
      formattedData[key][item.type] = parseFloat(item.total) || 0;
    });

    return formattedData;
  },

  async getCategoryBreakdown(userId, startDate, endDate) {
    const whereClause = { userId };
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }

    const categoryData = await Transaction.findAll({
      where: whereClause,
      attributes: [
        'categoryId',
        'type',
        [fn('SUM', col('Transaction.amount')), 'total'],
        [fn('COUNT', col('Transaction.id')), 'count']
      ],
      include: [{
        model: Category,
        attributes: ['name', 'color', 'icon']
      }],
      group: ['categoryId', 'type', 'Category.id'],
      order: [[fn('SUM', col('Transaction.amount')), 'DESC']],
      raw: true
    });

    // Format data
    const result = {
      income: [],
      expense: []
    };

    categoryData.forEach(item => {
      const categoryInfo = {
        id: item.categoryId,
        name: item['Category.name'],
        color: item['Category.color'],
        icon: item['Category.icon'],
        total: parseFloat(item.total) || 0,
        count: parseInt(item.count) || 0
      };

      if (item.type === 'income') {
        result.income.push(categoryInfo);
      } else {
        result.expense.push(categoryInfo);
      }
    });

    return result;
  },

  async getBudgetComparison(userId, monthlyBudget) {
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyExpenses = await Transaction.findAll({
      where: {
        userId,
        type: 'expense',
        date: {
          [Op.gte]: currentMonth,
          [Op.lt]: nextMonth
        }
      },
      attributes: [
        [fn('SUM', col('Transaction.amount')), 'total']
      ],
      raw: true
    });

    const totalExpenses = parseFloat(monthlyExpenses[0]?.total) || 0;
    const remaining = monthlyBudget - totalExpenses;
    const percentageUsed = (totalExpenses / monthlyBudget) * 100;

    return {
      budget: monthlyBudget,
      spent: totalExpenses,
      remaining: Math.max(0, remaining),
      percentageUsed: Math.min(100, percentageUsed),
      isOverBudget: totalExpenses > monthlyBudget
    };
  },

  async getTopExpenses(userId, limit = 10, startDate, endDate) {
    const whereClause = { userId, type: 'expense' };
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }

    const topExpenses = await Transaction.findAll({
      where: whereClause,
      include: [{
        model: Category,
        attributes: ['name', 'color', 'icon']
      }],
      order: [['amount', 'DESC']],
      limit,
      attributes: ['id', 'amount', 'description', 'date']
    });

    return topExpenses;
  },

  async getFinancialSummary(userId, period = 'month') {
    let startDate;
    const endDate = new Date();

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setDate(1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setMonth(0, 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(1);
    }

    const summary = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      attributes: [
        'type',
        [fn('SUM', col('Transaction.amount')), 'total'],
        [fn('COUNT', col('Transaction.id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const result = {
      period,
      startDate,
      endDate,
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
    result.savingsRate = result.totalIncome > 0 ? 
      ((result.totalIncome - result.totalExpense) / result.totalIncome * 100) : 0;

    return result;
  }
};

module.exports = analyticsService;
