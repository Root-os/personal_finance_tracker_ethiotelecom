const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/trends', analyticsController.getMonthlyTrends);
router.get('/categories', analyticsController.getCategoryBreakdown);
router.post('/budget', analyticsController.getBudgetComparison);
router.get('/top-expenses', analyticsController.getTopExpenses);
router.get('/summary', analyticsController.getFinancialSummary);

module.exports = router;
