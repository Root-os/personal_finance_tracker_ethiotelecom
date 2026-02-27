const jwt = require("jsonwebtoken");
const { RefreshToken } = require("../models");
const { User } = require("../models");
const CONFIG = require("../config/config");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, CONFIG.jwt.secret);

    // Live session check (Industry Standard)
    if (decoded.sid) {
      const session = await RefreshToken.findOne({
        where: { id: decoded.sid, isRevoked: false }
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Session has been revoked"
        });
      }
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token"
    });
  }
};

module.exports = authMiddleware;