const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const refreshTokenMiddleware = require('../middleware/refreshTokenMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { userSchema, refreshTokenSchema, loginSchema, verifyEmailSchema, logoutSchema, passwordResetSchema } = require('../helper/schema');
const authMiddleware = require('../middleware/authMiddleware');

// Apply rate limiting to auth routes
router.use(authLimiter);

router.post('/register', validate(userSchema), authController.register);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', validate(passwordResetSchema), authController.resendVerification);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshTokenMiddleware);
router.post('/logout', validate(logoutSchema), authController.logout);

// Protected routes
router.post('/logout-all', authMiddleware, authController.logoutAll);

module.exports = router;
