const analyticsService = require("../../services/analyticsService");
const { sequelize, User, Category, Transaction } = require("../../models");

describe("AnalyticsService", () => {
  let user;
  let foodCategory;
  let salaryCategory;

  beforeEach(async () => {
    // setup.js force-syncs and truncates, so we can seed freely
    user = await User.create({
      name: "Analytics Unit",
      userName: "analytics_unit",
      email: "analytics_unit@example.com",
      password: "hashed",
      emailVerified: true,
    });

    foodCategory = await Category.create({
      name: "Food",
      color: "#FF5722",
      icon: "🍔",
      userId: user.id,
    });

    salaryCategory = await Category.create({
      name: "Salary",
      color: "#4CAF50",
      icon: "💰",
      userId: user.id,
    });

    // Create some transactions across dates
    await Transaction.bulkCreate([
      {
        userId: user.id,
        categoryId: salaryCategory.id,
        amount: 1000,
        type: "income",
        date: new Date(),
        description: "Monthly salary",
      },
      {
        userId: user.id,
        categoryId: foodCategory.id,
        amount: 50,
        type: "expense",
        date: new Date(),
        description: "Lunch",
      },
      {
        userId: user.id,
        categoryId: foodCategory.id,
        amount: 25,
        type: "expense",
        date: new Date(),
        description: "Coffee",
      },
    ]);
  });

  test("getFinancialSummary returns totals and balance", async () => {
    const summary = await analyticsService.getFinancialSummary(user.id, "month");

    expect(summary).toHaveProperty("totalIncome");
    expect(summary).toHaveProperty("totalExpense");
    expect(summary).toHaveProperty("balance");

    expect(summary.totalIncome).toBe(1000);
    expect(summary.totalExpense).toBe(75);
    expect(summary.balance).toBe(925);
  });

  test("getCategoryBreakdown groups by category and type", async () => {
    const breakdown = await analyticsService.getCategoryBreakdown(user.id);

    expect(breakdown).toHaveProperty("income");
    expect(breakdown).toHaveProperty("expense");

    const incomeNames = breakdown.income.map((c) => c.name);
    const expenseNames = breakdown.expense.map((c) => c.name);

    expect(incomeNames).toContain("Salary");
    expect(expenseNames).toContain("Food");

    const food = breakdown.expense.find((c) => c.name === "Food");
    expect(food.total).toBe(75);
    expect(food.count).toBe(2);
  });

  test("getTopExpenses returns highest expenses first", async () => {
    const top = await analyticsService.getTopExpenses(user.id, 2);
    expect(Array.isArray(top)).toBe(true);
    expect(top.length).toBe(2);
    expect(parseFloat(top[0].amount)).toBeGreaterThanOrEqual(parseFloat(top[1].amount));
  });

  test("getBudgetComparison computes spent and remaining", async () => {
    const budget = await analyticsService.getBudgetComparison(user.id, 100);
    expect(budget.budget).toBe(100);
    expect(budget.spent).toBe(75);
    expect(budget.remaining).toBe(25);
    expect(budget.isOverBudget).toBe(false);
  });

  test("getMonthlyTrends returns keyed year-month with income/expense", async () => {
    const trends = await analyticsService.getMonthlyTrends(user.id, 1);
    const keys = Object.keys(trends);
    expect(keys.length).toBeGreaterThan(0);

    const currentKey = keys[keys.length - 1];
    expect(trends[currentKey]).toHaveProperty("income");
    expect(trends[currentKey]).toHaveProperty("expense");
  });
});
