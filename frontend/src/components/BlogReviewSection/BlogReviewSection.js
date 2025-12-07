import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import "./BlogReviewSection.css";

const BlogReviewSection = ({ blogId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Đọc user từ localStorage mỗi khi render
    const getUser = () => {
        try {
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            console.log("Current user from localStorage:", user);
            return user;
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            return null;
        }
    };

    // Debug: Log user mỗi khi component render
    useEffect(() => {
        const user = getUser();
        const token = localStorage.getItem("token");
        console.log("ReviewSection mounted/updated - User:", user);
        console.log("ReviewSection mounted/updated - Token:", token ? "Present" : "Missing");
    });

    // Lấy danh sách review
    useEffect(() => {
        if (!blogId) return;
        setLoading(true);
        axios
            .get(`/api/blogreviews?blogId=${blogId}`)
            .then((res) => setReviews(res.data))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [blogId]);

    // Gửi review mới
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const user = getUser();
        const token = localStorage.getItem("token");
        console.log("Submitting review with user:", user);
        console.log("Token:", token);

        if (!user) {
            setError("Vui lòng đăng nhập để gửi đánh giá");
            setSubmitting(false);
            return;
        }

        if (!token) {
            setError("Token không hợp lệ, vui lòng đăng nhập lại");
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                "/api/blogreviews",
                { blogId, rating: Number(rating), text: review },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Review submitted successfully:", response.data);
            setReview("");
            setRating(0);
            // Reload reviews
            const res = await axios.get(`/api/blogreviews?blogId=${blogId}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
        setSubmitting(false);
    };

    const user = getUser();

    return (
        <div className="blog-review-section">
            <h2>Reviews ({reviews.length})</h2>
            {/* Debug info */}
            {/* <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                Debug: User logged in: {user ? 'Yes' : 'No'} | 
                Token: {localStorage.getItem("token") ? 'Present' : 'Missing'}
            </div> */}
            {!user ? (
                <div className="review-login-warning">Đăng nhập để sử dụng tính năng</div>
            ) : (
                <form className="review-form" onSubmit={handleSubmit}>
                    <div className="rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={star <= (hover || rating) ? "star filled" : "star"}
                                onClick={() => setRating(Number(star))}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <textarea
                        placeholder="Bạn nghĩ gì về bài viết này?"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        disabled={submitting}
                    />
                    {error && <div className="review-error">{error}</div>}
                    <button type="submit" disabled={!rating || !review || submitting}>
                        Gửi đánh giá
                    </button>
                </form>
            )}
            {/* {loading ? (
                <div>Đang tải đánh giá...</div>
            ) : ( */}
            <div className="review-list">
                {reviews.map((r, idx) => (
                    <div className="review-item" key={r._id || idx}>
                        <div className="review-header">
                            <span className="review-name">{r.name}</span>
                            <span className="review-date">
                                {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                            <span className="review-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={
                                            star <= Number(r.rating) ? "star filled" : "star"
                                        }
                                    >
                                        ★
                                    </span>
                                ))}
                            </span>
                            {(user && (user.role === "admin" || user.id === r.userId)) && (
                                <button
                                    className="review-delete-btn"
                                    title="Xoá bình luận"
                                    onClick={async () => {
                                        if (window.confirm("Bạn chắc chắn muốn xoá bình luận này?")) {
                                            try {
                                                await axios.delete(`/api/blogreviews/${r._id}`, {
                                                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                                                });
                                                setReviews(reviews.filter((item) => item._id !== r._id));
                                            } catch (err) {
                                                alert(err.response?.data?.message || "Xoá thất bại!");
                                            }
                                        }
                                    }}
                                >
                                    Xoá
                                </button>
                            )}
                        </div>
                        <div className="review-text">{r.text}</div>
                    </div>
                ))}
            </div>
            {/* )} */}
        </div>
    );
};

export default BlogReviewSection;
