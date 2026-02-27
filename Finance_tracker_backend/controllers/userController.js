const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);

  res.json({
    success: true,
    data: user,
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

exports.deleteProfile = asyncHandler(async (req, res) => {
  await authService.deleteProfile(req.user.id);

  res.json({
    success: true,
    message: "Profile deleted successfully",
  });
});