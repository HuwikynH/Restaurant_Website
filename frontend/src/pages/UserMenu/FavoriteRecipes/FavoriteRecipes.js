import React, { useState, useEffect } from "react";
import "./FavoriteRecipes.css";
import axios from "../../../utils/axios";
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid";
import RecipeSkeletonGrid from "../../../components/RecipeSkeletonGrid/RecipeSkeletonGrid";
import PagePagination from "../../../components/PagePagination/PagePagination";

function FavoriteRecipes() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currPage, setCurrPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/recipes/favorites?page=${currPage}&limit=${limit}`
        );
        setFavoriteRecipes(response.data.recipes);
        setTotalPage(Math.ceil(response.data.total / limit));
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách món ăn yêu thích");
        console.error("Lỗi khi tải món ăn yêu thích:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteRecipes();
  }, [currPage]);

  const handlePageChange = (page) => {
    setCurrPage(page);
  };

  return (
    <div className="favorite-recipes">
      <div className="favorite-recipes-header">
        <h1>Món ăn yêu thích</h1>
        <p>Danh sách các món ăn bạn đã đánh dấu yêu thích</p>
      </div>

      {loading ? (
        <>
          <p className="loading-text">Đang tải món ăn yêu thích...</p>
          <RecipeSkeletonGrid number={8} />
        </>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : favoriteRecipes.length === 0 ? (
        <p className="empty-text">Bạn chưa có món ăn yêu thích nào</p>
      ) : (
        <>
          <RecipeGrid recipeList={favoriteRecipes} />
          <PagePagination
            totalPage={totalPage}
            currPage={currPage}
            limit={limit}
            siblings={1}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default FavoriteRecipes;
