const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Database health check
router.get("/health/db", async (req, res, next) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: "OK",
            db: "CONNECTED",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        err.statusCode = 503;
        next(err);
    }
});

// Root API info
router.get("/", (req, res) => {
    res.json({
        message: "Personal Finance Tracker API",
        version: "1.0.0",
        status: "Production Ready",
        documentation: "/api",
        endpoints: {
            auth: "/api/v1/auth",
            users: "/api/v1/users",
            categories: "/api/v1/categories",
            transactions: "/api/v1/transactions",
            dashboard: "/api/v1/dashboard",
            analytics: "/api/v1/analytics",
            passwordReset: "/api/v1/password-reset"
        }
    });
});

module.exports = router;
