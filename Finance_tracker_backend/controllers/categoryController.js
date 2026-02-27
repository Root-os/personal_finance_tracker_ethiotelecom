const categoryService = require("../services/categoryService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.user.id);

  res.json({
    success: true,
    data: categories,
  });
});

exports.getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await categoryService.getCategoryStats(req.user.id);

  res.json({
    success: true,
    data: stats,
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.updateCategory(id, req.body, req.user.id);

  res.json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await categoryService.deleteCategory(id, req.user.id);

  res.json({
    success: true,
    message: result.message,
  });
});

