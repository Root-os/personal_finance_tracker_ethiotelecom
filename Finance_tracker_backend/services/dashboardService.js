const { Transaction, Category } = require("../models");
const { Op } = require("sequelize");
const { fn, col } = require("sequelize");

const dashboardService = {
  async getDashboardStats(userId) {
    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get monthly summary
    const monthlySummary = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
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

    const monthlyIncome = monthlySummary.find(s => s.type === 'income')?.total || 0;
    const monthlyExpense = monthlySummary.find(s => s.type === 'expense')?.total || 0;
    const monthlyBalance = monthlyIncome - monthlyExpense;

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      include: [{
        model: Category,
        attributes: ['name', 'color', 'icon']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'amount', 'type', 'date', 'description']
    });

    // Get category breakdown for current month
    const categoryBreakdown = await Transaction.findAll({
      where: {
        userId,
        type: 'expense',
        date: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      },
      attributes: [
        'categoryId',
        [fn('SUM', col('Transaction.amount')), 'total'],
        [fn('COUNT', col('Transaction.id')), 'count']
      ],
      include: [{
        model: Category,
        attributes: ['name', 'color', 'icon']
      }],
      group: ['categoryId', 'Category.id'],
      order: [[fn('SUM', col('Transaction.amount')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Get total balance (all time)
    const totalSummary = await Transaction.findAll({
      where: { userId },
      attributes: [
        'type',
        [fn('SUM', col('Transaction.amount')), 'total']
      ],
      group: ['type'],
      raw: true
    });

    const totalIncome = totalSummary.find(s => s.type === 'income')?.total || 0;
    const totalExpense = totalSummary.find(s => s.type === 'expense')?.total || 0;
    const totalBalance = totalIncome - totalExpense;

    return {
      monthly: {
        income: parseFloat(monthlyIncome) || 0,
        expense: parseFloat(monthlyExpense) || 0,
        balance: parseFloat(monthlyBalance) || 0
      },
      total: {
        income: parseFloat(totalIncome) || 0,
        expense: parseFloat(totalExpense) || 0,
        balance: parseFloat(totalBalance) || 0
      },
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        amount: parseFloat(t.amount),
        type: t.type,
        date: t.date,
        description: t.description,
        category: t.Category ? {
          name: t.Category.name,
          color: t.Category.color,
          icon: t.Category.icon
        } : null
      })),
      topExpenseCategories: categoryBreakdown.map(c => ({
        id: c.categoryId,
        name: c['Category.name'],
        color: c['Category.color'],
        icon: c['Category.icon'],
        total: parseFloat(c.total) || 0,
        count: parseInt(c.count) || 0
      }))
    };
  },

  async getQuickStats(userId) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const getStatsForPeriod = async (startDate) => {
      const stats = await Transaction.findAll({
        where: {
          userId,
          date: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          'type',
          [fn('SUM', col('Transaction.amount')), 'total']
        ],
        group: ['type'],
        raw: true
      });

      const income = stats.find(s => s.type === 'income')?.total || 0;
      const expense = stats.find(s => s.type === 'expense')?.total || 0;
      
      return {
        income: parseFloat(income) || 0,
        expense: parseFloat(expense) || 0,
        balance: parseFloat(income - expense) || 0
      };
    };

    const [weekly, monthly, yearly] = await Promise.all([
      getStatsForPeriod(startOfWeek),
      getStatsForPeriod(startOfMonth),
      getStatsForPeriod(startOfYear)
    ]);

    return {
      weekly,
      monthly,
      yearly
    };
  }
};

module.exports = dashboardService;
