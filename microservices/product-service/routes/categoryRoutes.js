const express = require("express");
const router = express.Router();
const {
    getCategoryById,
    updateCategory,
    getAllCategories,
    createCategory,
    deleteCategory,
} = require("../controllers/categoryController");

// --- Public API Routes for Categories ---

// GET all categories
router.get("/", getAllCategories);

// POST a new category
router.post("/", createCategory);

// GET a single category by ID
router.get("/:id", getCategoryById);

// PUT to update a category by ID
router.put("/:id", updateCategory);

// DELETE a category by ID
router.delete("/:id", deleteCategory);

module.exports = router;