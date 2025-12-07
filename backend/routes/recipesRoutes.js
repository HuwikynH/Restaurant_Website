const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getRecipeById,
    getTopLikedRecipes,
    getTopViewedRecipes,
    getRandomRecipes,
    getRandomRecipesForBigSwiper,
    getAllRecipesApproved,
    getRandomTags,
    getRecipesByTag,
    getRecipesByTitleAndIngredient,
    increaseViewCount,
    getRecipeComments,
    addRecipeComment,
    updateRecipeComment,
    deleteRecipeComment,
    getTopCommentedRecipes,
    getRecipeOverview,
} = require("../controllers/recipeController");
const favoriteRoutes = require("./favoriteRoutes");

// Sử dụng routes cho chức năng yêu thích
router.use("/", favoriteRoutes);

router.get("/all-recipes-approved", getAllRecipesApproved);

// GET /api/recipes/top-liked
router.get("/top-liked", getTopLikedRecipes);

// GET /api/recipes/top-viewed
router.get("/top-viewed", getTopViewedRecipes);

// GET /api/recipes/random-recipes
router.get("/random-recipes", getRandomRecipes);

router.get("/random-recipes-big-swiper", getRandomRecipesForBigSwiper);

// GET /api/recipes/random-tags
router.get("/random-tags", getRandomTags);

// GET /api/recipes/search
router.get("/search-tags", getRecipesByTag);

router.get("/search-combined", getRecipesByTitleAndIngredient);

router.patch("/:id/view", increaseViewCount);

// GET /api/recipes/top-comments
router.get("/top-comments", getTopCommentedRecipes);

// GET /api/recipes/overview
router.get("/overview", getRecipeOverview);

// Comment routes đặt TRƯỚC route động "/:id" để tránh bị nuốt
// GET /api/recipes/:id/comments
router.get("/:id/comments", getRecipeComments);

// POST /api/recipes/:id/comments
router.post("/:id/comments", auth, addRecipeComment);

// PUT /api/recipes/:recipeId/comments/:commentId
router.put("/:recipeId/comments/:commentId", auth, updateRecipeComment);

// DELETE /api/recipes/:recipeId/comments/:commentId
router.delete("/:recipeId/comments/:commentId", auth, deleteRecipeComment);

// Route động để sau cùng
router.get("/:id", getRecipeById);

module.exports = router;
