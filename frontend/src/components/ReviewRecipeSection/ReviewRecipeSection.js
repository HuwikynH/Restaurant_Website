import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/axios";
import "./ReviewRecipeSection.css";

const ReviewSection = ({ recipeId, blogId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(0);
    const currentUser = user;
    const [menuOpenId, setMenuOpenId] = useState(null);
    const menuRef = useRef();

    const isAdmin = currentUser && currentUser.isAdmin;

    // Lấy danh sách review/bình luận
    useEffect(() => {
        if (recipeId) {
            setLoading(true);
            axios
                .get(`/api/recipes/${recipeId}/comments`)
                .then((res) => setReviews(res.data))
                .catch(() => setReviews([]))
                .finally(() => setLoading(false));
        } else if (blogId) {
            setLoading(true);
            axios
                .get(`/api/blogreviews?blogId=${blogId}`)
                .then((res) => setReviews(res.data))
                .catch(() => setReviews([]))
                .finally(() => setLoading(false));
        }
    }, [recipeId, blogId]);

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpenId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Gửi review mới
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            if (recipeId) {
                await axios.post(
                    `/api/recipes/${recipeId}/comments`,
                    { content: review, rating },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setReview("");
                setRating(0);
                // Reload reviews
                const res = await axios.get(`/api/recipes/${recipeId}/comments`);
                setReviews(res.data);
            } else if (blogId) {
                await axios.post(
                    "/api/blogreviews",
                    { blogId, rating, text: review },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setReview("");
                setRating(0);
                // Reload reviews
                const res = await axios.get(`/api/blogreviews?blogId=${blogId}`);
                setReviews(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
        setSubmitting(false);
    };

    // Sửa bình luận
    const handleEdit = (comment) => {
        setEditingId(comment._id);
        setEditContent(comment.text || comment.content);
        setEditRating(comment.rating || 0);
    };

    const handleEditSubmit = async (e, comment) => {
        e.preventDefault();
        try {
            await axios.put(
                `/api/recipes/${recipeId}/comments/${comment._id}`,
                { content: editContent, rating: editRating },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setEditingId(null);
            setEditContent("");
            setEditRating(0);
            // Reload
            const res = await axios.get(`/api/recipes/${recipeId}/comments`);
            setReviews(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi khi sửa bình luận");
        }
    };

    // Xóa bình luận
    const handleDelete = async (comment) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            await axios.delete(`/api/recipes/${recipeId}/comments/${comment._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            // Reload
            const res = await axios.get(`/api/recipes/${recipeId}/comments`);
            setReviews(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi khi xóa bình luận");
        }
    };

    return (
        <div className="recipe-review-section">
            <h2>Bình luận ({reviews.length})</h2>
            {!user && (
                <div className="review-login-warning review-login-warning-prominent">
                    Đăng nhập để sử dụng tính năng bình luận
                </div>
            )}
            {user && (
                <form className="review-form" onSubmit={handleSubmit}>
                    {(recipeId || blogId) && (
                        <div className="rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= (hover || rating) ? "star filled" : "star"}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    )}
                    <textarea
                        placeholder={
                            recipeId
                                ? "Bạn nghĩ gì về công thức này?"
                                : "Bạn nghĩ gì về bài viết này?"
                        }
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        disabled={submitting}
                    />
                    {error && <div className="review-error">{error}</div>}
                    <button
                        type="submit"
                        disabled={
                            !review ||
                            submitting ||
                            ((recipeId || blogId) && !rating)
                        }
                    >
                        Gửi bình luận
                    </button>
                </form>
            )}
            <div className="review-list">
                {reviews.map((r, idx) => {
                    // So sánh nhiều trường hợp để xác định chủ bình luận
                    const userId = currentUser && (currentUser._id || currentUser.id);
                    const commentUserId = r.user?._id || r.user?.id || r.user;
                    const isOwner =
                        userId && commentUserId && userId.toString() === commentUserId.toString();
                    return (
                        <div className="review-item" key={r._id || idx}>
                            <div className="review-header">
                                <span className="review-name">
                                    {r.name || r.user?.username || r.user?.name || "Ẩn danh"}
                                </span>
                                <span className="review-date">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                                <span className="review-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={
                                                star <= (r.rating || 5)
                                                    ? "star filled"
                                                    : "star"
                                            }
                                        >
                                            ★
                                        </span>
                                    ))}
                                </span>
                                {(isOwner || isAdmin) && (
                                    <span style={{ marginLeft: "auto", position: "relative" }}>
                                        <button
                                            className="review-menu-btn"
                                            onClick={() =>
                                                setMenuOpenId(menuOpenId === r._id ? null : r._id)
                                            }
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: 20,
                                            }}
                                            aria-label="Tùy chọn bình luận"
                                        >
                                            &#8942;
                                        </button>
                                        {menuOpenId === r._id && (
                                            <div className="review-menu-dropdown" ref={menuRef}>
                                                {isOwner && (
                                                    <button
                                                        className="review-edit-btn"
                                                        onClick={() => {
                                                            handleEdit(r);
                                                            setMenuOpenId(null);
                                                        }}
                                                    >
                                                        Sửa
                                                    </button>
                                                )}
                                                <button
                                                    className="review-delete-btn"
                                                    onClick={() => {
                                                        handleDelete(r);
                                                        setMenuOpenId(null);
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </span>
                                )}
                            </div>
                            {editingId === r._id ? (
                                <form
                                    onSubmit={(e) => handleEditSubmit(e, r)}
                                    className="review-edit-form"
                                >
                                    <div className="rating" style={{ marginBottom: 8 }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={
                                                    star <= editRating ? "star filled" : "star"
                                                }
                                                onClick={() => setEditRating(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        required
                                        style={{ width: "100%", minHeight: 60, marginBottom: 8 }}
                                    />
                                    <button type="submit" className="review-edit-save-btn">
                                        Lưu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="review-edit-cancel-btn"
                                    >
                                        Hủy
                                    </button>
                                </form>
                            ) : (
                                <div className="review-text">{r.text || r.content}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewSection;
