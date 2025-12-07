import React from "react";
import "./Explore.css";
import RecipeGrid from "../RecipeGrid/RecipeGrid";

function Explore({ randomRecipeList }) {
    return (
        <div className="explore-more-wrapper" id="explore-more">
            <div className="explore-more-title">
                <h2>Khám phá thêm</h2>
            </div>
            <RecipeGrid recipeList={randomRecipeList} />
        </div>
    );
}

export default Explore;
