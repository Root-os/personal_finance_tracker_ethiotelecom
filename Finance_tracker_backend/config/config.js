const path = require("path");
const dotenv = require("dotenv");
const logger = require("../utils/logger");
const { envSchema } = require("../helper/schema");

// 1. Load environment variables BEFORE validation
if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: path.join(__dirname, "..", ".env.test"), quiet: true });
}
// Always load base .env for shared defaults
dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });

// 2. Validate combined process.env
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    logger.error(`❌ Invalid environment variables: ${error.message}`);
    process.exit(1);
}

const CONFIG = {
    env: envVars.NODE_ENV,
    isTest: envVars.NODE_ENV === "test",
    isDev: envVars.NODE_ENV === "development",
    isProd: envVars.NODE_ENV === "production",
    port: envVars.PORT,
    logLevel: envVars.LOG_LEVEL,
    db: {
        name: envVars.DB_NAME,
        user: envVars.DB_USER,
        password: envVars.DB_PASSWORD,
        host: envVars.DB_HOST,
        port: envVars.DB_PORT,
        dialect: envVars.DB_DIALECT,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        refreshSecret: envVars.JWT_REFRESH_SECRET,
        expire: envVars.JWT_EXPIRE,
        refreshExpire: envVars.JWT_REFRESH_EXPIRE,
    },
    email: {
        host: envVars.EMAIL_HOST,
        port: envVars.EMAIL_PORT,
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASS,
    },
    cors: {
        origin: envVars.FRONTEND_URL,
        origins: envVars.CORS_ORIGINS.split(",").map(o => o.trim()).filter(Boolean),
    },
};

module.exports = CONFIG;
