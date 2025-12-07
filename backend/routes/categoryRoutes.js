const express = require("express");
const router = express.Router();
const {
    getCategoryById,
    updateCategory,
    getAllCategories,
    createCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const auth = require("../middleware/auth");

// Lấy tất cả danh mục
router.get("/", getAllCategories);

// Lấy danh mục theo id
router.get("/:id", getCategoryById);

// Cập nhật danh mục
router.put("/:id", auth, updateCategory);

router.post("/", auth, createCategory);
router.delete("/:id", auth, deleteCategory);

module.exports = router;
