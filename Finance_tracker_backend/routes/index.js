const express = require("express");
const router = express.Router();

// New, versioned, recruiter-friendly resource naming
router.use("/users", require("./userRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/transactions", require("./transactionRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/auth", require("./authRoutes"));
router.use("/password-reset", require("./passwordResetRoutes"));
router.use("/sessions", require("./sessionRoutes"));
router.use("/analytics", require("./analyticsRoutes"));

module.exports = router;