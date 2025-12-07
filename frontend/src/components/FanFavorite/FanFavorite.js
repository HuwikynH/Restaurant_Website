import React from "react";
import "./FanFavorite.css";
import RecipeGrid from "../RecipeGrid/RecipeGrid";

function FanFavorite({ topLikedRecipeList }) {
    return (
        <div className="fan-favorite-wrapper" id="fan-favorite">
            <div className="fan-favorite-title">
                <h2>Công thức ưu thích</h2>
            </div>
            <RecipeGrid recipeList={topLikedRecipeList} />
        </div>
    );
}

export default FanFavorite;
