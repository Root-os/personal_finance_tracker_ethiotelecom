const logger = require("../utils/logger");

module.exports = function requestLogger(req, res, next) {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });
    next();
};