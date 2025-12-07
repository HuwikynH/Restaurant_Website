const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;

// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách danh mục:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy danh mục theo ID
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

// Cập nhật danh mục
const updateCategory = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        console.error("Lỗi khi cập nhật danh mục:", err);
        res.status(500).json({ message: "Không thể cập nhật danh mục" });
    }
};

//
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

const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        //  xoa anh trong cloudinary
        const folderPath = `categories/${categoryId}`;
        const result = await cloudinary.api.resources({
            type: "upload",
            prefix: folderPath + "/",
            max_results: 100,
        });

        const publicIds = result.resources.map((file) => file.public_id);
        if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
        }

        // 2. xoa danh muc khoi mongo
        const deleted = await Category.findByIdAndDelete(categoryId);

        if (!deleted) {
            return res.status(404).json({ msg: "Không tìm thấy danh mục" });
        }

        res.status(200).json({ msg: "Đã xóa danh mục và ảnh liên quan" });
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
