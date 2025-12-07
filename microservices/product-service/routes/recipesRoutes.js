const express = require("express");
const router = express.Router();

const {
    getRecipeById,
    getTopViewedRecipes,
    getRandomRecipes,
    getAllRecipes,
    getAllRecipesApproved,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRandomTags,
    getRecipesByTag,
    getRecipesByTitleAndIngredient,
    increaseViewCount,
    getRecipeComments,
    addRecipeComment,
    updateRecipeComment,
    deleteRecipeComment,
    getFavoriteStatus,
    addFavorite,
    removeFavorite,
} = require("../controllers/recipeController");


// --- Public API Routes for Recipes ---

// GET all recipes with pagination and search
router.get("/", getAllRecipes);

// GET all approved recipes
router.get("/approved", getAllRecipesApproved);

// GET top viewed recipes
router.get("/top-viewed", getTopViewedRecipes);

// GET random recipes, accepts a 'size' query param
router.get("/random", getRandomRecipes);

// GET random tags
router.get("/tags/random", getRandomTags);

// GET recipes by a specific tag using a 'query' param
router.get("/tags/search", getRecipesByTag);

// GET recipes by searching title and ingredients with a 'query' param
router.get("/search", getRecipesByTitleAndIngredient);

// POST a new recipe
router.post("/", createRecipe);

// --- Routes with a specific Recipe ID ---

// GET a single recipe by ID
router.get("/:id", getRecipeById);

// PUT to update a recipe by ID
router.put("/:id", updateRecipe);

// DELETE a recipe by ID
router.delete("/:id", deleteRecipe);

// POST to increment the view count of a recipe
router.post("/:id/view", increaseViewCount);

// Comments
router.get("/:id/comments", getRecipeComments);
router.post("/:id/comments", addRecipeComment);
router.put("/:recipeId/comments/:commentId", updateRecipeComment);
router.delete("/:recipeId/comments/:commentId", deleteRecipeComment);

// Favorites
router.get("/:id/favorite-status", getFavoriteStatus);
router.post("/:id/favorite", addFavorite);
router.delete("/:id/favorite", removeFavorite);


module.exports = router;