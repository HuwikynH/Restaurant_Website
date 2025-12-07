import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Recipes.css";

import axios from "axios";
import {
  startProgress,
  stopProgress,
} from "../../../utils/NProgress/NProgress";

import RecipesPageBgImage from "../../../assets/img/recipes-background.webp";
import SearchBar from "../../../components/SearchBar/SearchBar";
import ExploreRecipeMenu from "../../../components/ExploreRecipeMenu/ExploreRecipeMenu";
import RecipeTagList from "../../../components/RecipeTagList/RecipeTagList";
import PagePagination from "../../../components/PagePagination/PagePagination";
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid";
import RecipeSkeletonGrid from "../../../components/RecipeSkeletonGrid/RecipeSkeletonGrid";
import SmallLineSeparator from "../../../components/SmallLineSeparator/SmallLineSeparator";

function Recipes() {
  const [recipeList, setRecipeList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [randomTags, setRandomTags] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [recipeError, setRecipeError] = useState(null);
  const [recipeFilterLoading, setRecipeFilterLoading] = useState(false);
  const [category, setCategory] = useState("All");
  const [currPage, setCurrPage] = useState(1);
  const [limit, setLimit] = useState(16);

  // Get All Categories (chỉ từ product-service)
  useEffect(() => {
    const fetchCategories = async () => {
      startProgress();

      setCategoryLoading(true);
      try {
        const productBase = process.env.REACT_APP_PRODUCT_API_URL;
        if (!productBase) {
          throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
        }

        const res = await axios.get(`${productBase}/api/categories`);
        const cats = Array.isArray(res.data) ? res.data : res.data.data || [];
        setCategoryList(cats);
      } catch (err) {
        console.error("Lỗi khi fetch danh mục từ product-service:", err);
        setCategoryError("Không thể tải danh sách danh mục");
      } finally {
        setCategoryLoading(false);
        stopProgress();
      }
    };

    fetchCategories();
  }, []);

  // Get ALL Recipes isApprove = true (chỉ từ product-service)
  useEffect(() => {
    const fetchRecipes = async () => {
      startProgress();
      setRecipeLoading(true);
      try {
        const productBase = process.env.REACT_APP_PRODUCT_API_URL;
        if (!productBase) {
          throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
        }

        const res = await axios.get(`${productBase}/api/recipes/approved`);
        console.log("Dữ liệu lấy về từ product-service:", res.data);
        const recipes = Array.isArray(res.data)
          ? res.data
          : res.data.recipes && Array.isArray(res.data.recipes)
          ? res.data.recipes
          : [];

        setRecipeList(recipes);
      } catch (err) {
        console.error("Lỗi khi fetch danh sách món ăn:", err);
        setRecipeError("Không thể tải danh sách món ăn");
        setRecipeList([]); // Đặt về mảng rỗng nếu có lỗi
      } finally {
        setRecipeLoading(false);
        stopProgress();
      }
    };

    fetchRecipes();
  }, []);

  // TagList (ưu tiên từ product-service)
  useEffect(() => {
    const fetchRandomTags = async () => {
      try {
        const productBase = process.env.REACT_APP_PRODUCT_API_URL;
        let tags = [];

        if (productBase) {
          try {
            const res = await axios.get(`${productBase}/api/recipes/tags/random`);
            console.log("Dữ liệu tag ngẫu nhiên từ product-service:", res.data);
            tags = Array.isArray(res.data) ? res.data : res.data.tags || [];
          } catch (err) {
            console.error("Lỗi tag từ product-service, fallback backend:", err);
          }
        }

        if (!tags.length) {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/recipes/random-tags`
          );
          console.log("Dữ liệu tag ngẫu nhiên từ backend:", res.data);
          tags = Array.isArray(res.data) ? res.data : res.data.tags || [];
        }

        setRandomTags(tags);
      } catch (err) {
        console.error("Lỗi khi fetch tag ngẫu nhiên:", err);
      }
    };

    fetchRandomTags();
  }, []);

  // Display skeleton card when changing Category filter
  useEffect(() => {
    setRecipeFilterLoading(true);

    const timeout = setTimeout(() => {
      setRecipeFilterLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [category]);

  // navigation for searchBar
  const navigate = useNavigate();
  const handleSearch = (query) => {
    if (query.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(query)}&type=combined`);
    }
  };

  // Filter the recipe list by category
  let filteredRecipes = recipeList;
  if (category !== "All") {
    const selectedCategory = categoryList.find((cat) => cat.name === category);
    if (selectedCategory) {
      filteredRecipes = recipeList.filter((recipe) => {
        // recipe.category có thể là ID (string) hoặc object được populate từ product-service
        const categoryFromRecipe = recipe.category;
        const categoryIdFromRecipe =
          categoryFromRecipe && typeof categoryFromRecipe === "object"
            ? categoryFromRecipe._id || categoryFromRecipe.id
            : categoryFromRecipe;

        const categoryNameFromRecipe =
          categoryFromRecipe && typeof categoryFromRecipe === "object"
            ? categoryFromRecipe.displayName || categoryFromRecipe.name
            : null;

        const selectedId = selectedCategory._id;
        const selectedName = selectedCategory.displayName || selectedCategory.name;

        // Ưu tiên so sánh theo ID nếu trùng, nếu không thì fallback so sánh theo tên
        return (
          (categoryIdFromRecipe && categoryIdFromRecipe === selectedId) ||
          (categoryNameFromRecipe && categoryNameFromRecipe === selectedName)
        );
      });
    }
  }

  // Reset currPage to 1 whenever the selected category changes
  useEffect(() => {
    setCurrPage(1);
  }, [category]);

  let totalPage = Math.ceil(filteredRecipes.length / limit);

  // Paginate the filtered recipes based on the current page and limit per page
  let paginatedRecipes = filteredRecipes.slice(
    (currPage - 1) * limit,
    currPage * limit
  );

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
    <div className="recipes">
      <div className="recipes-background">
        <img src={RecipesPageBgImage} alt="Recipes page background" />
      </div>

      <div className="recipes-body-wrapper">
        <div className="title">
          <h1>Món ăn & Ý tưởng thực đơn</h1>
          <p>
            Chúng tôi hiểu những băn khoăn của bạn. Chúng tôi đồng hành cùng
            bạn. Đây là những món ăn tuyệt vời, được thử nghiệm và tinh chỉnh
            để giúp bạn chuẩn bị những bữa ăn ngon cho gia đình.
          </p>
        </div>
        <SearchBar onSearch={handleSearch} />
        <RecipeTagList tags={randomTags} />

        {categoryLoading ? (
          <>
            <p className="category-loading">Đang tải danh mục...</p>
          </>
        ) : categoryError ? (
          <p>{categoryError}</p>
        ) : (
          <ExploreRecipeMenu
            category={category}
            setCategory={setCategory}
            categoryList={categoryList}
          />
        )}

        <SmallLineSeparator />

        {recipeLoading || recipeFilterLoading ? (
          <>
            <p className="recipe-loading">Đang tải món ăn...</p>
            <RecipeSkeletonGrid number={8} />
          </>
        ) : recipeError ? (
          <p>{recipeError}</p>
        ) : (
          <RecipeGrid recipeList={paginatedRecipes} />
        )}

        <PagePagination
          totalPage={totalPage}
          currPage={currPage}
          limit={limit}
          siblings={1}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default Recipes;
