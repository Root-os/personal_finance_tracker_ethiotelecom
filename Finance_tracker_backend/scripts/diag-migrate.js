const migrator = require("../config/migrator");
const { connectDB } = require("../config/db");
const logger = require("../utils/logger");

const diag = async () => {
    await connectDB();

    const pending = await migrator.pending();
    logger.info("--- PENDING ---");
    pending.forEach(m => logger.info(m.name));

    const executed = await migrator.executed();
    logger.info("--- EXECUTED ---");
    executed.forEach(m => logger.info(m.name));

    logger.info("--- DONE ---");
};

diag().catch(err => {
    logger.error("DIAG ERROR: %o", err);
    process.exit(1);
});
