const helmet = require("helmet");
const CONFIG = require("./config");

function applySecurityMiddleware(app) {
    app.use(
        helmet(
            CONFIG.isProd
                ? {
                    contentSecurityPolicy: {
                        useDefaults: true,
                        directives: {
                            defaultSrc: ["'self'"],
                            frameAncestors: ["'none'"],
                        },
                    },
                    crossOriginEmbedderPolicy: false,
                }
                : undefined
        )
    );
}

module.exports = { applySecurityMiddleware };