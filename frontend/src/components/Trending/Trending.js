import React from "react";
import "./Trending.css";
import RecipeGrid from "../RecipeGrid/RecipeGrid";

function Trending({ topViewedRecipeList }) {
    return (
        <div className="trending-wrapper">
            <div className="trending-title">
                <h2>Xu hướng</h2>
            </div>
            <RecipeGrid recipeList={topViewedRecipeList} />
        </div>
    );
}

export default Trending;
