const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { categorySchema, categoryUpdateSchema } = require("../helper/schema");

router.use(authMiddleware);

router.post("/", validate(categorySchema), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/stats", categoryController.getCategoryStats);
router.put("/:id", validate(categoryUpdateSchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;