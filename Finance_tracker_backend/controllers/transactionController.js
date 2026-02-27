// controllers/transactionController.js
const transactionService = require("../services/transactionService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.createTransaction = asyncHandler(async (req, res) => {
  const result = await transactionService.createTransaction(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: result,
  });
});

exports.getTransactions = asyncHandler(async (req, res) => {
  const result = await transactionService.getTransactions(req.user.id, req.query);

  res.json({
    success: true,
    data: result,
  });
});

exports.getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await transactionService.getTransactionById(id, req.user.id);

  res.json({
    success: true,
    data: result,
  });
});

exports.updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await transactionService.updateTransaction(id, req.body, req.user.id);

  res.json({
    success: true,
    message: "Transaction updated successfully",
    data: result,
  });
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await transactionService.deleteTransaction(id, req.user.id);

  res.json({
    success: true,
    message: result.message,
  });
});

exports.getTransactionSummary = asyncHandler(async (req, res) => {
  const result = await transactionService.getTransactionSummary(req.user.id, req.query);

  res.json({
    success: true,
    data: result,
  });
});
