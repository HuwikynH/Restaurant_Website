import React, { useState, useEffect } from "react";
import "./RecipeCard.css";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

function RecipeCard({ image, name, link, views, id, price, rating = 5, ratingCount = 0, onAdd, disableFavorite = false }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (disableFavorite) return;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      // Chưa đăng nhập thì không cần check favorite-status để tránh 401
      return;
    }

    // Kiểm tra xem công thức có trong danh sách yêu thích không
    const checkFavoriteStatus = async () => {
      try {
        const response = await axios.get(`/api/recipes/${id}/favorite-status`);
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        // Nếu chưa đăng nhập hoặc token hết hạn, bỏ qua im lặng để tránh spam 401
        if (error?.response?.status !== 401) {
          console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        }
      }
    };

    checkFavoriteStatus();
  }, [id, disableFavorite]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      return;
    }
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (isFavorite) {
        await axios.delete(`/api/recipes/${id}/favorite`);
        setIsFavorite(false);
        toast.info("Đã xóa khỏi công thức yêu thích!");
      } else {
        await axios.post(`/api/recipes/${id}/favorite`);
        setIsFavorite(true);
        toast.success("Đã thêm vào công thức yêu thích!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái yêu thích:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recipe-card">
      <div className="col">
        <Link className="card-link" to={link}>
          <div className="card">
            <img loading="lazy" src={image} alt="Food" />
            <div className="card-body">
              <h5 className="card-title">{name}</h5>
              <div className="rating-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= Math.round(rating) ? "star filled" : "star"}
                  >
                    ★
                  </span>
                ))}
                {ratingCount > 0 && (
                  <span className="rating-count">({ratingCount})</span>
                )}
              </div>
              <div className="meta-row">
                {typeof price === "number" && price > 0 && (
                  <p className="price">{price.toLocaleString("vi-VN")} đ</p>
                )}
                <p className="views">{views} lượt xem</p>
              </div>
              {typeof onAdd === "function" && (
                <button
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdd();
                  }}
                >
                  Thêm món
                </button>
              )}
            </div>
            {!disableFavorite && (
              <i
                className={`bx bxs-heart favorite-icon ${
                  isFavorite ? "favorited" : ""
                }`}
                onClick={handleFavoriteClick}
              ></i>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

export default React.memo(RecipeCard);
