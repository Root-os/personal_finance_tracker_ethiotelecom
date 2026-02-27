const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { userUpdateSchema } = require("../helper/schema");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", userController.getUserProfile);
router.put("/me", validate(userUpdateSchema), userController.updateProfile);
router.delete("/me", userController.deleteProfile);

module.exports = router;