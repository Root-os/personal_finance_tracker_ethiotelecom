const passwordResetService = require('../services/passwordResetService');
const { passwordResetSchema, passwordResetConfirmSchema } = require('../helper/schema');
const { asyncHandler } = require('../middleware/errorHandler');

exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { error } = passwordResetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const { email } = req.body;
  const result = await passwordResetService.requestPasswordReset(email);

  res.json({
    success: true,
    message: result.message
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { error } = passwordResetConfirmSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const { token, password } = req.body;
  const result = await passwordResetService.resetPassword(token, password);

  res.json({
    success: true,
    message: result.message
  });
});

exports.verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Reset token is required'
    });
  }

  try {
    await passwordResetService.verifyResetToken(token);
    res.json({
      success: true,
      message: 'Reset token is valid'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});
