const Category = require("../models/Category");

// @desc    Get all categories
// @route   GET /api/categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách danh mục:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
        res.status(200).json(category);
    } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// @desc    Create a new category
// @route   POST /api/categories
const createCategory = async (req, res) => {
    try {
        const newCat = new Category(req.body);
        await newCat.save();
        res.status(201).json(newCat);
    } catch (err) {
        console.error("Lỗi khi tạo danh mục:", err);
        res.status(500).json({ message: "Không thể tạo danh mục" });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error("Lỗi khi cập nhật danh mục:", err);
        res.status(500).json({ message: "Không thể cập nhật danh mục" });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ msg: "Không tìm thấy danh mục" });
        }

        res.status(200).json({ msg: "Đã xóa danh mục thành công" });
    } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err);
        res.status(500).json({ msg: "Lỗi server", error: err });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    updateCategory,
    createCategory,
    deleteCategory,
};