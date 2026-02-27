const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { transactionSchema, updateTransactionSchema, transactionQuerySchema } = require("../helper/schema");

// All transaction routes require authentication
router.use(authMiddleware); 

router.post("/", validate(transactionSchema), transactionController.createTransaction);
router.get("/", validate(transactionQuerySchema, 'query'), transactionController.getTransactions);
router.get("/summary", transactionController.getTransactionSummary);
router.get("/:id", transactionController.getTransactionById);
router.put("/:id", validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;