const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const logger = require("../utils/logger");
const { generalLimiter } = require("./rateLimiter");
const requestLogger = require("./requestLogger");

function applyCoreMiddleware(app) {
    app.use(express.json({ limit: "10kb" }));
    app.use(cookieParser());

    app.use(
        morgan("combined", {
            stream: { write: (message) => logger.info(message.trim()) },
        })
    );

    app.use(generalLimiter);
    app.use(requestLogger);
}

module.exports = { applyCoreMiddleware };