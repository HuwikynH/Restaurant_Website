const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getFavoriteRecipes,
  addToFavorites,
  removeFromFavorites,
  getFavoriteStatus,
} = require("../controllers/favoriteController");

// GET /api/recipes/favorites
router.get("/favorites", auth, getFavoriteRecipes);

// GET /api/recipes/:id/favorite-status
router.get("/:id/favorite-status", auth, getFavoriteStatus);

// POST /api/recipes/:id/favorite
router.post("/:id/favorite", auth, addToFavorites);

// DELETE /api/recipes/:id/favorite
router.delete("/:id/favorite", auth, removeFromFavorites);

module.exports = router;
