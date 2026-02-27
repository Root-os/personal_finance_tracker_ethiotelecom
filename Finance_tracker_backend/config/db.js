const { Sequelize } = require('sequelize');
const logger = require("../utils/logger");
const CONFIG = require('./config');

const sequelize = new Sequelize(
  CONFIG.db.name,
  CONFIG.db.user,
  CONFIG.db.password,
  {
    host: CONFIG.db.host,
    port: CONFIG.db.port,
    dialect: CONFIG.db.dialect,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: (msg) => logger.debug(msg)
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed: %o', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};
