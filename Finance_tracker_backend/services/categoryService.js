const { Op } = require("sequelize");
const { Transaction, Category, sequelize } = require("../models");

const categoryService = {
  async createCategory(categoryData, userId) {
    const { name, color, icon } = categoryData;

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      where: { name, userId }
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const category = await Category.create({
      name,
      color,
      icon,
      userId
    });

    return category;
  },

  async getCategories(userId) {
    const categories = await Category.findAll({
      where: { userId },
      order: [['name', 'ASC']]
    });

    return categories;
  },

  async getCategoryById(categoryId, userId) {
    const category = await Category.findOne({
      where: { id: categoryId, userId }
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  },

  async updateCategory(categoryId, updateData, userId) {
    const category = await Category.findOne({
      where: { id: categoryId, userId }
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name: updateData.name,
          userId,
          id: { [Op.ne]: categoryId }
        }
      });

      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }
    }

    await category.update(updateData);
    return category;
  },

  async deleteCategory(categoryId, userId) {
    const category = await Category.findOne({
      where: { id: categoryId, userId }
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has associated transactions
    const transactionCount = await Transaction.count({
      where: { categoryId }
    });

    if (transactionCount > 0) {
      throw new Error("Cannot delete category with associated transactions");
    }

    await category.destroy();
    return { message: "Category deleted successfully" };
  },

  async getCategoryStats(userId) {

    const stats = await Category.findAll({
      where: { userId },
      attributes: [
        'id',
        'name',
        'color',
        'icon',
        [
          sequelize.literal(`
            (
              SELECT COALESCE(SUM(t.amount), 0)
              FROM Transactions t
              WHERE t.categoryId = Category.id
              AND t.type = 'expense'
              AND t.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            )
          `),
          'monthlyExpense'
        ],
        [
          sequelize.literal(`
            (
              SELECT COALESCE(COUNT(t.id), 0)
              FROM Transactions t
              WHERE t.categoryId = Category.id
            )
          `),
          'transactionCount'
        ]
      ],
      order: [['name', 'ASC']]
    });

    return stats.map(stat => ({
      id: stat.id,
      name: stat.name,
      color: stat.color,
      icon: stat.icon,
      monthlyExpense: parseFloat(stat.dataValues.monthlyExpense) || 0,
      transactionCount: parseInt(stat.dataValues.transactionCount) || 0
    }));
  }
};

module.exports = categoryService;
