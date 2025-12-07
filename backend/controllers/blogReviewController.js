const BlogReview = require("../models/BlogReview");
const User = require("../models/User");

// Lấy danh sách review theo blogId
exports.getReviewsByBlog = async (req, res) => {
    try {
        const { blogId } = req.query;
        if (!blogId) return res.status(400).json({ message: "Thiếu blogId" });
        const reviews = await BlogReview.find({ blogId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Thêm review mới (yêu cầu userId)
exports.createReview = async (req, res) => {
    try {
        const { blogId, rating, text } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Đăng nhập để sử dụng tính năng" });
        }
        if (!blogId || !rating || !text) {
            return res.status(400).json({ message: "Thiếu thông tin review" });
        }
        // Lấy tên người dùng từ User model
        let name = "User";
        const user = await User.findById(userId);
        if (user) {
            name = user.username || user.name || "User";
        }
        const ratingNumber = Number(rating);
        if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({ message: "Rating không hợp lệ" });
        }
        const review = new BlogReview({ blogId, userId, name, rating: ratingNumber, text });
        await review.save();
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Xóa review (chỉ admin hoặc chủ review)
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user?.id;
        const isAdmin = req.user?.role === "admin";

        const review = await BlogReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Không tìm thấy review" });

        // Chỉ admin hoặc chủ review mới được xóa
        if (!isAdmin && review.userId?.toString() !== userId) {
            return res.status(403).json({ message: "Không có quyền xóa review này" });
        }

        await BlogReview.findByIdAndDelete(reviewId);
        res.json({ message: "Đã xóa review thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
