const { sequelize } = require("../config/db");
const logger = require("../utils/logger");

const inspect = async () => {
    const [results] = await sequelize.query("DESCRIBE RefreshTokens");
    logger.info("--- COLUMNS ---");
    results.forEach(col => logger.info(`${col.Field}: ${col.Type}`));
    logger.info("--- DONE ---");
    process.exit(0);
};

inspect().catch(err => {
    logger.error("Inspection failed: %o", err);
    process.exit(1);
});
