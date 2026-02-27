const CONFIG = require("./config/config");
const app = require("./app");
const { connectDB } = require("./config/db");
const logger = require("./utils/logger");

const startServer = async () => {
  try {
    // 1. Connect to Database (Validation happens inside require("./config/config"))
    await connectDB();

    // 2. Apply Migrations (Production-safe handling)
    if (!CONFIG.isTest) {
      const migrator = require("./config/migrator");
      try {
        await migrator.up();
        logger.info("✅ Database migrations applied successfully");
      } catch (migError) {
        logger.error("❌ Migration failed:", migError);
        // In production, we might want to halt if migrations fail
        if (CONFIG.isProd) process.exit(1);
      }
    }

    // 3. Start Server
    const PORT = CONFIG.port;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${CONFIG.env}`);
    });
  } catch (error) {
    logger.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

// Start the engine
if (require.main === module) {
  startServer();
}

module.exports = app;
