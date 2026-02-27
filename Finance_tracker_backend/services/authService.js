const bcrypt = require("bcrypt");
const { User } = require("../models");
const CONFIG = require("../config/config");
const { Op } = require("sequelize");
const { generateTokens, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require("../utils/tokenUtils");
const crypto = require("crypto");
const logger = require("../utils/logger");
const { sendMail } = require("../utils/mailer");
const { renderMjmlTemplate } = require("../utils/emailTemplates");
const { seedCategories } = require("../utils/categorySeeder");

const sendVerificationEmail = async (email, verificationToken, userName) => {
 const verifyUrl = `${CONFIG.cors.origin}/verify-email?token=${verificationToken}`;
  const html = renderMjmlTemplate("verify-email", {
    previewText: "Verify your email to activate your account",
    userName,
    verifyUrl,
    expiresIn: "24 hours",
    currentYear: new Date().getFullYear().toString(),
  });

  await sendMail({ to: email, subject: "Verify your email", html });
  logger.info(`Verification email sent to ${email}`);
};

const sendWelcomeEmail = async (email, userName) => {
  const loginUrl = `${CONFIG.cors.origin}/login`;
  const html = renderMjmlTemplate("welcome", {
    previewText: "Welcome — your account is ready",
    userName,
    loginUrl,
    currentYear: new Date().getFullYear().toString(),
  });

  await sendMail({ to: email, subject: "Welcome to Personal Finance Tracker", html });
  logger.info(`Welcome email sent to ${email}`);
};

const authService = {
  async register(userData, deviceInfo) {
    const { name, userName, email, password } = userData;

    // Use CONFIG.isTest or ENV check for dev/prod logic
    const isEmailRequired = !!email;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { userName },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.userName === userName ? 'username' : 'email';
      const err = new Error(`${field} already exists`);
      err.statusCode = 409;
      throw err;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken: email ? emailVerificationToken : null,
      emailVerificationExpires: email ? emailVerificationExpires : null,
    });

    user.deviceInfo = deviceInfo; // Temporary attach for generateTokens

    if (email) {
      try {
        await sendVerificationEmail(email, emailVerificationToken, user.userName);
      } catch (error) {
        logger.error("Error sending verification email:", error);
      }
    }

    // Generate tokens ONLY if user did not provide an email
    // If they provide email, they must verify first before getting a session
    let tokens = null;
    if (!email) {
      tokens = await generateTokens(user);
      // Seed categories immediately for users without email (guest/dev mode)
      try {
        await seedCategories(user.id);
      } catch (err) {
        logger.error(`Error during initial seeding for user ${user.id}:`, err);
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        emailVerified: user.emailVerified
      },
      tokens
    };
  },

  async resendVerification(email) {
    // Security: do not reveal if email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { message: "If an account with that email exists, a verification email has been sent." };
    }

    if (!user.email) {
      return { message: "If an account with that email exists, a verification email has been sent." };
    }

    if (user.emailVerified === true) {
      return { message: "Email already verified" };
    }

    // Rotate token if missing/expired
    const expired = !user.emailVerificationExpires || user.emailVerificationExpires < new Date();
    if (!user.emailVerificationToken || expired) {
      user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
    }

    await sendVerificationEmail(user.email, user.emailVerificationToken, user.userName);

    return { message: "Verification email sent" };
  },

  async verifyEmail(token) {
    const user = await User.findOne({
      where: {
        emailVerificationToken: token
      }
    });

    if (!user) {
      const err = new Error("Invalid or expired verification token");
      err.statusCode = 400;
      throw err;
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      const err = new Error("Invalid or expired verification token");
      err.statusCode = 400;
      throw err;
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    if (user.email) {
      try {
        // Seed categories upon successful verification
        await seedCategories(user.id);
        await sendWelcomeEmail(user.email, user.userName);
      } catch (error) {
        logger.error("Error post-verification (seeding/email):", error);
      }
    }

    return {
      id: user.id,
      name: user.name,
      userName: user.userName,
      email: user.email,
      emailVerified: user.emailVerified
    };
  },

  async login(credentials, deviceInfo) {
    const { userName, password } = credentials;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { userName },
          { email: userName }
        ]
      }
    });

    if (!user) {
      const err = new Error("you are not registered with this username or email");
      err.statusCode = 404;
      throw err;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    // If user registered with an email, requires verification before login
    if (user.email && user.emailVerified !== true) {
      const err = new Error("Email not verified");
      err.statusCode = 403;
      throw err;
    }

    // Generate tokens
    user.deviceInfo = deviceInfo;
    const tokens = await generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        emailVerified: user.emailVerified
      },
      tokens
    };
  },

  async refreshToken(refreshToken, deviceInfo) {
    const decoded = await verifyRefreshToken(refreshToken);

    // Revoke the old refresh token
    await revokeRefreshToken(refreshToken);

    // Generate new tokens
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    user.deviceInfo = deviceInfo;
    const tokens = await generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        emailVerified: user.emailVerified
      },
      tokens
    };
  },

  async logout(refreshToken) {
    await revokeRefreshToken(refreshToken);
  },

  async logoutAll(userId) {
    await revokeAllUserTokens(userId);
  },

  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    return user;
  },

  async updateProfile(userId, updateData) {
    const { name, email } = updateData;

    // Check if email is being updated and already exists
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        const err = new Error("Email already exists");
        err.statusCode = 409;
        throw err;
      }
    }

    const [updatedRowsCount] = await User.update(
      { name, email },
      {
        where: { id: userId },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }
    });

    return updatedUser;
  },

  async deleteProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    await revokeAllUserTokens(userId);
    await user.destroy();
  }
};

module.exports = authService;
