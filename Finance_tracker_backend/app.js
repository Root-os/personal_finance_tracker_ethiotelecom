const express = require("express");
const { applySecurityMiddleware } = require("./config/helmet");
const { applyCors } = require("./config/cors");
const { applyCoreMiddleware } = require("./middleware");
const routes = require("./routes");
const systemRoutes = require("./routes/systemRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Basic optimization
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Security
applySecurityMiddleware(app);
applyCors(app);

// Core middleware
applyCoreMiddleware(app);

// Routes
app.use("/api", systemRoutes);
app.use("/api/v1", routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;