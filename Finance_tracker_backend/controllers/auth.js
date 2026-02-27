const CONFIG = require("../config/config");
const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorHandler");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: CONFIG.isProd,
  sameSite: CONFIG.isProd ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth",
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
};

exports.register = asyncHandler(async (req, res) => {
  const deviceInfo = {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
  };
  const result = await authService.register(req.body, deviceInfo);

  setRefreshCookie(res, result?.tokens?.refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result
  });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: user
  });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.resendVerification(email);

  res.status(200).json({
    success: true,
    message: "Verification email sent"
  });
});

exports.login = asyncHandler(async (req, res) => {
  const deviceInfo = {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
  };
  const result = await authService.login(req.body, deviceInfo);

  setRefreshCookie(res, result?.tokens?.refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  const deviceInfo = {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
  };
  const result = await authService.refreshToken(refreshToken, deviceInfo);

  setRefreshCookie(res, result?.tokens?.refreshToken);

  res.json({
    success: true,
    message: "Tokens refreshed successfully",
    data: result
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  await authService.logout(refreshToken);

  clearRefreshCookie(res);

  res.json({
    success: true,
    message: "Logout successful"
  });
});

exports.logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);

  clearRefreshCookie(res);

  res.json({
    success: true,
    message: "Logged out from all devices"
  });
});
