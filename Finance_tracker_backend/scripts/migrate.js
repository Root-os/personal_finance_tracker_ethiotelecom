const migrator = require("../config/migrator");
const { connectDB } = require("../config/db");
const logger = require("../utils/logger");

const main = async () => {
  const direction = process.argv[2];

  await connectDB();

  if (direction === "down") {
    await migrator.down({ to: 0 });
    return;
  }

  await migrator.up();
};


main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Migration script failed: %o", err);
    process.exit(1);
  });
