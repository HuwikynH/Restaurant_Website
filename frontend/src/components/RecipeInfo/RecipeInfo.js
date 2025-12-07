import React, { useState, useEffect } from "react";
import "./RecipeInfo.css";
import Profile from "../../assets/img/ratatouille-icon.png";
import RecipeSwiper from "../RecipeSwiper/RecipeSwiper";
import SmallLineSeparator from "../SmallLineSeparator/SmallLineSeparator";
import RecipeIngredient from "../RecipeIngredient/RecipeIngredient";
import RecipeDirection from "../RecipeDirection/RecipeDirection";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

function RecipeInfo({ recipe, recipeImageList }) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAuthor = currentUser && recipe.createdBy?._id === currentUser.id;

  // Thêm state cho nút yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await axios.get(
          `/api/recipes/${recipe._id}/favorite-status`
        );
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        // Không cần báo lỗi ở đây
      }
    };
    if (recipe && recipe._id) checkFavoriteStatus();
  }, [recipe]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      return;
    }
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (isFavorite) {
        await axios.delete(`/api/recipes/${recipe._id}/favorite`);
        setIsFavorite(false);
        toast.info("Đã xóa khỏi công thức yêu thích!");
      } else {
        await axios.post(`/api/recipes/${recipe._id}/favorite`);
        setIsFavorite(true);
        toast.success("Đã thêm vào công thức yêu thích!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recipe-info-wrapper">
      <h1 className="recipe-title">
        {recipe.title}
        <i
          className={`bx bxs-heart favorite-icon-detail ${
            isFavorite ? "favorited" : ""
          }`}
          onClick={handleFavoriteClick}
          style={{
            marginLeft: 16,
            cursor: "pointer",
            fontSize: 32,
            verticalAlign: "middle",
          }}
        ></i>
      </h1>

      {/* Hiển thị rating trung bình ngay dưới tên món */}
      <div className="recipe-rating-header">
        {(() => {
          const avgRating =
            typeof recipe.rating === "number" ? recipe.rating : 5;
          const count = recipe.ratingCount || 0;
          return (
            <>
              <span className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(avgRating) ? "star filled" : "star"
                    }
                  >
                    ★
                  </span>
                ))}
              </span>
              <span className="rating-text">
                {avgRating.toFixed(1)} / 5
                {" "}
                {count > 0 && <span>({count} đánh giá)</span>}
              </span>
            </>
          );
        })()}
      </div>

      <div className="recipe-detail">
        <div className="author">
          <span> Được đăng tải bởi</span>
          <img
            src={Profile}
            alt="User"
            className="user-icon"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              cursor: "pointer",
            }}
          />
          <span style={{ fontWeight: "bold" }}>
            {isAuthor
              ? currentUser.name || currentUser.username
              : recipe.createdBy?.name || recipe.createdBy?.username}
          </span>
        </div>

        <p>&quot;{recipe.description}&quot;</p>

        <div className="swiper-container">
          <RecipeSwiper recipeImageList={recipeImageList} />
        </div>

        <div className="cooking-detail">
          <span>
            <i className="bx bx-stopwatch"></i> Thời gian nấu:{" "}
            <span style={{ fontWeight: "bold" }}>{recipe.cookingTime}</span>
          </span>

          <span>
            <i className="bx bx-bowl-hot"></i> Phục vụ:{" "}
            <span style={{ fontWeight: "bold" }}>{recipe.serves} người</span>
          </span>
          <span>
            <i className="bx bx-fork"></i> Dinh dưỡng:{" "}
            <span style={{ fontWeight: "bold" }}>{recipe.calories} calo</span>
          </span>

          <span>
            <i className="bx bx-globe"></i> Nguồn gốc:{" "}
            <span style={{ fontWeight: "bold" }}>{recipe.origin}</span>
          </span>
        </div>
        <SmallLineSeparator />
        <RecipeIngredient ingredients={recipe.ingredients} />
        <RecipeDirection steps={recipe.steps} />
      </div>
    </div>
  );
}

export default RecipeInfo;
