import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";

import { startProgress, stopProgress } from "../../../utils/NProgress/NProgress";

import RecipeInfo from "../../../components/RecipeInfo/RecipeInfo";
import RecipeGridOneColumn from "../../../components/RecipeGridOneColumn/RecipeGridOneColumn";
import RecipeSkeletonGrid from "../../../components/RecipeSkeletonGrid/RecipeSkeletonGrid";
import LineSeparator from "../../../components/LineSeparator/LineSeparator";
import FanFavorite from "../../../components/FanFavorite/FanFavorite";
import ReviewRecipeSection from "../../../components/ReviewRecipeSection/ReviewRecipeSection";
import SmallLineSeparator from "../../../components/SmallLineSeparator/SmallLineSeparator";

function RecipeDetail() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [maybeYouLikeList, setMaybeYouLikeList] = useState([]);
    const [topLikedRecipeList, setTopLikedRecipeList] = useState([]);

    const [loadingMaybeYouLikeList, setLoadingMaybeYouLikeList] = useState(true);
    const [loadingTopLiked, setLoadingTopLiked] = useState(true);
    const [loading, setLoading] = useState(true);

    const [errorMaybeYouLikeList, setErrorMaybeYouLikeList] = useState("");
    const [errorTopLiked, setErrorTopLiked] = useState("");
    const [error, setError] = useState("");

    // Fetch the main recipe for display (ưu tiên product-service)
    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            try {
                const productBase = process.env.REACT_APP_PRODUCT_API_URL;

                if (productBase) {
                    const res = await fetch(`${productBase}/api/recipes/${id}`);
                    if (!res.ok) throw new Error("Không tìm thấy món ăn");
                    const data = await res.json();
                    setRecipe(data);
                    return;
                }

                // Chỉ dùng backend khi chưa cấu hình product-service
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes/${id}`);
                if (!res.ok) throw new Error("Không tìm thấy món ăn");
                const data = await res.json();
                setRecipe(data);
            } catch (err) {
                setError(err.message || "Không thể tải món ăn");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    // Tăng view cho món (ưu tiên product-service)
    useEffect(() => {
        const increaseView = async () => {
            const productBase = process.env.REACT_APP_PRODUCT_API_URL;

            if (productBase) {
                try {
                    await axios.post(`${productBase}/api/recipes/${id}/view`);
                    return;
                } catch (err) {
                    console.error("Lỗi tăng view ở product-service, fallback backend:", err);
                }
            }

            axios
                .patch(`${process.env.REACT_APP_API_URL}/api/recipes/${id}/view`)
                .catch((err) => console.error("Lỗi tăng views backend:", err));
        };

        increaseView();
    }, [id]);

    // Fetch random recipes for Có thể bạn thích (ưu tiên product-service)
    useEffect(() => {
        const fetchRandomRecipes = async () => {
            setLoadingMaybeYouLikeList(true);
            startProgress();
            try {
                const productBase = process.env.REACT_APP_PRODUCT_API_URL;
                let list = [];

                if (productBase) {
                    try {
                        const res = await axios.get(`${productBase}/api/recipes/random`);
                        list = Array.isArray(res.data)
                            ? res.data
                            : res.data.recipes || res.data.data || [];
                    } catch (err) {
                        console.error("Lỗi random từ product-service, fallback backend:", err);
                    }
                }

                if (!list.length) {
                    const res = await axios.get(
                        `${process.env.REACT_APP_API_URL}/api/recipes/random-recipes`
                    );
                    list = Array.isArray(res.data)
                        ? res.data
                        : res.data.recipes || res.data.data || [];
                }

                setMaybeYouLikeList(list);
            } catch (err) {
                setErrorMaybeYouLikeList("Lỗi khi lấy món ăn ngẫu nhiên.");
                console.error("Lỗi khi lấy món ăn ngẫu nhiên:", err);
            } finally {
                stopProgress();
                setLoadingMaybeYouLikeList(false);
            }
        };

        fetchRandomRecipes();
    }, [id]);

    // get top liked / top viewed recipe for FanFavorite (ưu tiên product-service)
    useEffect(() => {
        const fetchTopLikedRecipeList = async () => {
            setLoadingTopLiked(true);
            startProgress();
            try {
                const productBase = process.env.REACT_APP_PRODUCT_API_URL;
                let list = [];

                if (productBase) {
                    try {
                        const res = await axios.get(
                            `${productBase}/api/recipes/top-viewed`
                        );
                        list = Array.isArray(res.data)
                            ? res.data
                            : res.data.recipes || res.data.data || [];
                    } catch (err) {
                        console.error("Lỗi top-viewed từ product-service, fallback backend:", err);
                    }
                }

                if (!list.length) {
                    const res = await axios.get(
                        `${process.env.REACT_APP_API_URL}/api/recipes/top-liked`
                    );
                    list = Array.isArray(res.data)
                        ? res.data
                        : res.data.recipes || res.data.data || [];
                }

                setTopLikedRecipeList(list);
            } catch (err) {
                setErrorTopLiked("Lỗi khi lấy món ăn nhiều like");
                console.error("Lỗi khi fetch món ăn nhiều like:", err);
            } finally {
                stopProgress();
                setLoadingTopLiked(false);
            }
        };

        fetchTopLikedRecipeList();
    }, [id]);

    if (loading) return <div>Đang tải món ăn...</div>;
    if (error) return <div>{error}</div>;

    // For Display image
    const combinedImages =
        recipe?.images && recipe.images.length > 0
            ? [recipe.imageThumb, ...recipe.images.filter((img) => img !== recipe.imageThumb)]
            : [recipe.imageThumb];

    return (
        <>
            <div className="recipe-detail-background">
                <img src={recipe.imageThumb} alt="Recipes page background" />
            </div>
            <div className="recipe-detail-container">
                <div className="recipe-detail-wrapper">
                    <div className="main-page">
                        <RecipeInfo recipe={recipe} recipeImageList={combinedImages} />

                        <SmallLineSeparator />
                        <ReviewRecipeSection recipeId={id} />
                    </div>

                    <div className="widget">
                        <span className="title">Có thể bạn thích</span>
                        {loadingMaybeYouLikeList ? (
                            <>
                                <p className="recipe-loading">Đang tải món ăn...</p>
                                <RecipeSkeletonGrid number={1} />
                            </>
                        ) : errorMaybeYouLikeList ? (
                            <p>{errorMaybeYouLikeList}</p>
                        ) : (
                            <RecipeGridOneColumn recipeList={maybeYouLikeList} />
                        )}
                    </div>
                </div>

                <div className="recipe-top-like">
                    <LineSeparator />
                    {loadingTopLiked ? (
                        <>
                            <p className="recipe-loading">Đang tải món ăn...</p>
                            <RecipeSkeletonGrid number={8} />
                        </>
                    ) : errorTopLiked ? (
                        <p>{errorTopLiked}</p>
                    ) : (
                        <FanFavorite topLikedRecipeList={topLikedRecipeList} />
                    )}
                </div>
            </div>
        </>
    );
}

export default RecipeDetail;
