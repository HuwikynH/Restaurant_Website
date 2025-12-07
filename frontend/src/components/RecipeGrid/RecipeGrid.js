import React from "react";
import "./RecipeGrid.css";

import RecipeCard from "../RecipeCard/RecipeCard";

function RecipeGrid({ recipeList, disableFavorite = false }) {
    // console.log("recipeList", recipeList);

    if (!Array.isArray(recipeList) || recipeList.length === 0) {
        return <div>Không có dữ liệu để hiển thị</div>;
    }

    return (
        <div className="recipe-grid-wrapper">
            <div className="card-container">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                    {recipeList.map((recipe) =>
                        recipe && recipe._id ? (
                            <RecipeCard
                                key={recipe._id}
                                id={recipe._id}
                                name={recipe.title}
                                image={recipe.imageThumb}
                                price={recipe.price}
                                views={recipe.views}
                                rating={typeof recipe.rating === "number" ? recipe.rating : 5}
                                ratingCount={recipe.ratingCount || 0}
                                link={`/recipes/${recipe._id}`}
                                onAdd={recipe.onAdd}
                                disableFavorite={disableFavorite}
                            />
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecipeGrid;
