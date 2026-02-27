const { verifyRefreshToken, generateTokens, revokeRefreshToken } = require("../utils/tokenUtils");
const CONFIG = require("../config/config");

const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    const decoded = await verifyRefreshToken(refreshToken);

    // Revoke the old refresh token
    await revokeRefreshToken(refreshToken);

    // Generate new tokens
    const user = { id: decoded.userId, userName: decoded.userName };
    const tokens = await generateTokens(user);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: CONFIG.isProd,
      sameSite: CONFIG.isProd ? "strict" : "lax",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        tokens
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = refreshTokenMiddleware;
