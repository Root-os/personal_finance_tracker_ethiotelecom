const dashboardService = require('../services/dashboardService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = await dashboardService.getDashboardStats(userId);
  
  res.json({
    success: true,
    data: stats
  });
});

exports.getQuickStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = await dashboardService.getQuickStats(userId);
  
  res.json({
    success: true,
    data: stats
  });
});
