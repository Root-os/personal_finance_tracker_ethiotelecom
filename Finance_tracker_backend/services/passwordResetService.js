const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require("sequelize");
const { User } = require('../models');
const logger = require('../utils/logger');
const { sendMail } = require('../utils/mailer');
const { renderMjmlTemplate } = require('../utils/emailTemplates');
const { revokeAllUserTokens } = require('../utils/tokenUtils');
const CONFIG = require('../config/config');

const createResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const createPasswordResetEmail = (resetToken, userName) => {
  const resetUrl = `${CONFIG.cors.origin}/reset-password?token=${resetToken}`;

  const html = renderMjmlTemplate("password-reset", {
    previewText: "Reset your password",
    userName,
    resetUrl,
    expiresIn: "1 hour",
    currentYear: new Date().getFullYear().toString(),
  });

  return {
    subject: 'Password Reset Request',
    html
  };
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const emailContent = createPasswordResetEmail(resetToken, userName);

    await sendMail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

const passwordResetService = {
  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = createResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry
    });

    // Send email
    await sendPasswordResetEmail(email, resetToken, user.name);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  },

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    // Revoke all sessions after password reset (security best practice)
    await revokeAllUserTokens(user.id);

    logger.info(`Password reset successful for user: ${user.userName}`);
    return { message: 'Password reset successful' };
  },

  async verifyResetToken(token) {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    return { valid: true };
  }
};

module.exports = passwordResetService;
