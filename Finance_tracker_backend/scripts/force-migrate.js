const migrator = require("../config/migrator");
const { connectDB } = require("../config/db");
const logger = require("../utils/logger");

const forceMigrate = async () => {
    await connectDB();

    const pending = await migrator.pending();
    logger.info(`Found ${pending.length} pending migrations.`);

    for (const m of pending) {
        logger.info(`Applying: ${m.name}`);
        await m.up();
    }

    if (pending.length > 0) {
        logger.info("Using migrator.up()...");
        await migrator.up();
        logger.info("Done!");
    } else {
        logger.info("Nothing to do.");
    }
};

forceMigrate().catch(err => {
    logger.error("Force migrate failed: %o", err);
});
