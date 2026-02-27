const { RefreshToken } = require("../models");
const { Op } = require("sequelize");
const { asyncHandler } = require("../middleware/errorHandler");

exports.listSessions = asyncHandler(async (req, res) => {
    const sessions = await RefreshToken.findAll({
        where: {
            userId: req.user.id,
            isRevoked: false,
            expiresAt: { [Op.gt]: new Date() },
        },
        attributes: ["id", "createdAt", "expiresAt", "userAgent", "ipAddress", "location"],
        order: [["createdAt", "DESC"]],
    });

    res.json({
        success: true,
        data: sessions,
    });
});

exports.revokeSession = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const token = await RefreshToken.findOne({
        where: { id, userId: req.user.id, isRevoked: false },
    });

    if (!token) {
        const err = new Error("Session not found");
        err.statusCode = 404;
        throw err;
    }

    await token.update({ isRevoked: true });

    res.json({
        success: true,
        message: "Session revoked",
    });
});
