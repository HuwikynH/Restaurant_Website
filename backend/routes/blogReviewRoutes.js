const express = require("express");
const router = express.Router();
const blogReviewController = require("../controllers/blogReviewController");
const auth = require("../middleware/auth"); // middleware xác thực

// Lấy danh sách review theo blogId
router.get("/", blogReviewController.getReviewsByBlog);
// Thêm review mới (yêu cầu đăng nhập)
router.post("/", auth, blogReviewController.createReview);
// Xóa review (chỉ admin hoặc chủ review)
router.delete("/:id", auth, blogReviewController.deleteReview);

module.exports = router;
