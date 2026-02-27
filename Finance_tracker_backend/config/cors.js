const cors = require("cors");
const CONFIG = require("./config");

function applyCors(app) {
    app.use(
        cors({
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            origin: (origin, callback) => {
                if (!origin || !CONFIG.isProd) {
                    return callback(null, true);
                }

                const allowed = CONFIG.cors.origins;

                if (allowed.length === 0) {
                    return callback(new Error("CORS is not configured for production"));
                }

                if (allowed.includes(origin)) {
                    return callback(null, true);
                }

                return callback(new Error("Not allowed by CORS"));
            },
        })
    );
}

module.exports = { applyCors };