// RecipeSearchResult.jsx
import React, { useEffect, useState } from "react";
import "./RecipeSearchResult.css";

import axios from "axios";
import RecipesPageBgImage from "../../../assets/img/recipes-background.webp";
import PagePagination from "../../../components/PagePagination/PagePagination";
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid";
import SmallLineSeparator from "../../../components/SmallLineSeparator/SmallLineSeparator";

import { useLocation } from "react-router-dom";
import SearchBar from "../../../components/SearchBar/SearchBar";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function RecipeSearchResult() {
    const [titleResults, setTitleResults] = useState([]);
    const [ingredientResults, setIngredientResults] = useState([]);
    const [tagResults, setTagResults] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currPage, setCurrPage] = useState(1);
    const [limit, setLimit] = useState(16);

    const query = useQuery();
    const searchQuery = query.get("query") || "";

    const type = query.get("type") || "tag";

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            setError(null);

            try {
                const productBase = process.env.REACT_APP_PRODUCT_API_URL;

                if (type === "combined") {
                    let byTitle = [];
                    let byIngredients = [];

                    if (productBase) {
                        try {
                            const res = await axios.get(
                                `${productBase}/api/recipes/search?query=${encodeURIComponent(
                                    searchQuery
                                )}`
                            );

                            const data = res.data || {};
                            byTitle = data.byTitle || data.titleResults || [];
                            byIngredients = data.byIngredients || data.ingredientResults || [];
                        } catch (err) {
                            console.error(
                                "Lỗi search combined từ product-service, fallback backend:",
                                err
                            );
                        }
                    }

                    if (!byTitle.length && !byIngredients.length) {
                        const res = await axios.get(
                            `${
                                process.env.REACT_APP_API_URL
                            }/api/recipes/search-combined?query=${encodeURIComponent(
                                searchQuery
                            )}`
                        );

                        const data = res.data || {};
                        byTitle = data.byTitle || [];
                        byIngredients = data.byIngredients || [];
                    }

                    setTitleResults(byTitle);
                    setIngredientResults(byIngredients);
                } else {
                    let tags = [];

                    if (productBase) {
                        try {
                            const res = await axios.get(
                                `${productBase}/api/recipes/tags/search?query=${encodeURIComponent(
                                    searchQuery
                                )}`
                            );
                            const data = res.data || {};
                            tags = Array.isArray(data) ? data : data.results || data.recipes || [];
                        } catch (err) {
                            console.error(
                                "Lỗi search tags từ product-service, fallback backend:",
                                err
                            );
                        }
                    }

                    if (!tags.length) {
                        const res = await axios.get(
                            `${
                                process.env.REACT_APP_API_URL
                            }/api/recipes/search-tags?query=${encodeURIComponent(
                                searchQuery
                            )}`
                        );
                        const data = res.data || {};
                        tags = Array.isArray(data) ? data : data.results || data.recipes || [];
                    }

                    setTagResults(tags);
                }
            } catch (err) {
                console.error("Lỗi khi tìm kiếm:", err);
                setError("Không thể tải kết quả tìm kiếm.");
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
        setCurrPage(1);
    }, [searchQuery, type]);

    let totalPage = Math.ceil(tagResults.length / limit);

    // Paginate the filtered recipes based on the current page and limit per page
    let paginatedRecipes = tagResults.slice((currPage - 1) * limit, currPage * limit);

    // handle page change
    function handlePageChange(value) {
        console.log(currPage);
        if (value === "<<") {
            setCurrPage(1);
        } else if (value === "<") {
            if (currPage !== 1) {
                setCurrPage(currPage - 1);
            }
        } else if (value === ">") {
            if (currPage !== totalPage) {
                setCurrPage(currPage + 1);
            }
        } else if (value === ">>") {
            setCurrPage(totalPage);
        } else if (value === " ..." || value === "... ") {
            setCurrPage(currPage);
        } else {
            setCurrPage(value);
        }
    }

    return (
        <div className="recipes-search-result">
            <div className="recipes-search-result-background">
                <img src={RecipesPageBgImage} alt="Recipes page background" />
            </div>

            <div className="recipes-search-result-body-wrapper">
                <div className="title">
                    <h1>Kết quả tìm kiếm</h1>
                    <p>
                        Những công thức khớp với từ khóa của bạn. Hãy thử điều chỉnh từ khóa nếu
                        chưa đúng mong muốn.
                    </p>
                </div>

                {loading ? (
                    <p>Đang tải kết quả...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : type === "combined" ? (
                    <>
                        {titleResults.length === 0 && ingredientResults.length === 0 ? (
                            <p>Không tìm thấy công thức phù hợp với từ khóa.</p>
                        ) : (
                            <>
                                {titleResults.length > 0 && (
                                    <>
                                        <h2>
                                            Kết quả theo Tiêu đề:
                                            <strong> {searchQuery || "(Trống)"}</strong>
                                        </h2>
                                        <SmallLineSeparator />

                                        <RecipeGrid recipeList={titleResults} />
                                    </>
                                )}

                                {ingredientResults.length > 0 && (
                                    <>
                                        <h2 style={{ marginTop: "50px" }}>
                                            Kết quả theo Nguyên liệu:
                                            <strong> {searchQuery || "(Trống)"}</strong>
                                        </h2>
                                        <SmallLineSeparator />

                                        <RecipeGrid recipeList={ingredientResults} />
                                    </>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {tagResults.length === 0 ? (
                            <p>Không tìm thấy công thức nào phù hợp với tag.</p>
                        ) : (
                            <>
                                <h2>
                                    Kết quả theo Tag:
                                    <strong> {searchQuery || "(Trống)"}</strong>
                                </h2>
                                <SmallLineSeparator />
                                <RecipeGrid recipeList={paginatedRecipes} />
                                {tagResults.length > limit && (
                                    <PagePagination
                                        totalPage={totalPage}
                                        currPage={currPage}
                                        limit={limit}
                                        siblings={1}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default RecipeSearchResult;
