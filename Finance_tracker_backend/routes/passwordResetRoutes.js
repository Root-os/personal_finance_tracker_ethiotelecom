const express = require('express');
const passwordResetController = require('../controllers/passwordResetController');
const { passwordResetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/request', passwordResetLimiter, passwordResetController.requestPasswordReset);
router.post('/reset', passwordResetController.resetPassword);
router.get('/verify/:token', passwordResetController.verifyResetToken);

module.exports = router;
