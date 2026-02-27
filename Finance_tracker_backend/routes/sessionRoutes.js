const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", sessionController.listSessions);
router.delete("/:id", sessionController.revokeSession);

module.exports = router;
