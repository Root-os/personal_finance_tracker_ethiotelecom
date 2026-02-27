const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { RefreshToken } = require("../models");
const CONFIG = require("../config/config");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getLocationFromIP = (ip) => {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.includes("::ffff:127.0.0.1")) {
    return "Localhost (Addis Ababa, ET)";
  }
  // This is a placeholder for a real geolocation lookup.
  // In a production app, you might use a library like geoip-lite or a service like ipapi.com
  return "Remote (Ethiopia)"; // Defaulting to ET as per context
};

const getRefreshExpiryDate = () => {
  const expiresAt = new Date();
  // Parse CONFIG.jwt.refreshExpire (e.g., "7d")
  const days = parseInt(CONFIG.jwt.refreshExpire) || 7;
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
};

const generateTokens = async (user) => {

  const refreshToken = jwt.sign(
    { userId: user.id, jti: crypto.randomUUID() },
    CONFIG.jwt.refreshSecret,
    { expiresIn: CONFIG.jwt.refreshExpire }
  );

  const tokenHash = hashToken(refreshToken);

  const session = await RefreshToken.create({
    tokenHash,
    token: refreshToken,
    userId: user.id,
    expiresAt: getRefreshExpiryDate(),
    userAgent: user.deviceInfo?.userAgent || null,
    ipAddress: user.deviceInfo?.ipAddress || null,
    location: getLocationFromIP(user.deviceInfo?.ipAddress),
  });

  // Re-sign accessToken with SID (Session ID)
  const accessToken = jwt.sign(
    {
      userId: user.id,
      userName: user.userName,
      sid: session.id
    },
    CONFIG.jwt.secret,
    { expiresIn: CONFIG.jwt.expire }
  );

  return { accessToken, refreshToken, sid: session.id };
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, CONFIG.jwt.refreshSecret);
    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      where: {
        tokenHash,
        userId: decoded.userId,
        isRevoked: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

const revokeRefreshToken = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.update(
    { isRevoked: true },
    { where: { tokenHash } }
  );
};

const revokeAllUserTokens = async (userId) => {
  await RefreshToken.update(
    { isRevoked: true },
    { where: { userId } }
  );
};

module.exports = {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
