jest.mock("nodemailer", () => {
  return {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue(true),
    })),
  };
});

const bcrypt = require("bcrypt");
const passwordResetService = require("../../services/passwordResetService");
const { User } = require("../../models");
const CONFIG = require("../../config/config");

describe("PasswordResetService", () => {
  beforeEach(async () => {
    // Ensure frontend url exists for email template creation
    // Validation is already done in CONFIG

    const hashed = await bcrypt.hash("OldPass123!", 10);
    await User.create({
      name: "Reset User",
      userName: "reset_user",
      email: "reset@example.com",
      password: hashed,
      emailVerified: true,
    });
  });

  test("requestPasswordReset stores token and calls nodemailer", async () => {
    const res = await passwordResetService.requestPasswordReset("reset@example.com");
    expect(res).toHaveProperty("message");

    const user = await User.findOne({ where: { email: "reset@example.com" } });
    expect(user.passwordResetToken).toBeTruthy();
    expect(user.passwordResetExpires).toBeTruthy();
  });

  test("requestPasswordReset does not reveal user existence", async () => {
    const res = await passwordResetService.requestPasswordReset("doesnotexist@example.com");
    expect(res).toHaveProperty("message");
  });

  test("verifyResetToken returns valid for unexpired token", async () => {
    await passwordResetService.requestPasswordReset("reset@example.com");
    const user = await User.findOne({ where: { email: "reset@example.com" } });

    const result = await passwordResetService.verifyResetToken(user.passwordResetToken);
    expect(result).toEqual({ valid: true });
  });

  test("resetPassword updates password and clears token", async () => {
    await passwordResetService.requestPasswordReset("reset@example.com");
    const user = await User.findOne({ where: { email: "reset@example.com" } });

    const result = await passwordResetService.resetPassword(user.passwordResetToken, "NewPass123!");
    expect(result).toHaveProperty("message", "Password reset successful");

    const updated = await User.findOne({ where: { email: "reset@example.com" } });
    expect(updated.passwordResetToken).toBe(null);
    expect(updated.passwordResetExpires).toBe(null);

    const matches = await bcrypt.compare("NewPass123!", updated.password);
    expect(matches).toBe(true);
  });

  test("resetPassword throws on invalid token", async () => {
    await expect(passwordResetService.resetPassword("badtoken", "NewPass123!"))
      .rejects.toThrow("Invalid or expired reset token");
  });
});
