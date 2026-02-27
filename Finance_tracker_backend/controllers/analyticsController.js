const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getMonthlyTrends = asyncHandler(async (req, res) => {
  const { months = 12 } = req.query;
  const userId = req.user.id;
  
  const trends = await analyticsService.getMonthlyTrends(userId, parseInt(months));
  
  res.json({
    success: true,
    data: trends
  });
});

exports.getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.user.id;
  
  const breakdown = await analyticsService.getCategoryBreakdown(userId, startDate, endDate);
  
  res.json({
    success: true,
    data: breakdown
  });
});

exports.getBudgetComparison = asyncHandler(async (req, res) => {
  let { monthlyBudget } = req.body;
  const { budgets } = req.body;
  const userId = req.user.id;

  // Backward compatibility: accept { budgets: [{ categoryId, budget }, ...] }
  // and interpret it as total monthly budget.
  if ((monthlyBudget === undefined || monthlyBudget === null) && Array.isArray(budgets)) {
    monthlyBudget = budgets.reduce((sum, b) => sum + (parseFloat(b?.budget) || 0), 0);
  }
  
  if (!monthlyBudget || monthlyBudget <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid monthly budget is required'
    });
  }
  
  const comparison = await analyticsService.getBudgetComparison(userId, parseFloat(monthlyBudget));
  
  res.json({
    success: true,
    data: comparison
  });
});

exports.getTopExpenses = asyncHandler(async (req, res) => {
  const { limit = 10, startDate, endDate } = req.query;
  const userId = req.user.id;
  
  const topExpenses = await analyticsService.getTopExpenses(
    userId, 
    parseInt(limit), 
    startDate, 
    endDate
  );
  
  res.json({
    success: true,
    data: topExpenses
  });
});

exports.getFinancialSummary = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const userId = req.user.id;
  
  const summary = await analyticsService.getFinancialSummary(userId, period);
  
  res.json({
    success: true,
    data: summary
  });
});
