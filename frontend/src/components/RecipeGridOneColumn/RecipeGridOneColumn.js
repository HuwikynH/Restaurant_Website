import React from "react";
import "./RecipeGridOneColumn.css"; // Đảm bảo CSS được áp dụng
import RecipeCard from "../RecipeCard/RecipeCard";

function RecipeGridOneColumn({ recipeList }) {
    if (!Array.isArray(recipeList) || recipeList.length === 0) {
        return <div>Không có dữ liệu để hiển thị</div>;
    }

    return (
        <div className="recipe-grid-one-column-wrapper">
            {recipeList.map((recipe) => (
                <RecipeCard
                    key={recipe._id}
                    name={recipe.title}
                    image={recipe.imageThumb}
                    price={recipe.price}
                    views={recipe.views}
                    link={`/recipes/${recipe._id}`}
                    id={recipe._id}
                />
            ))}
        </div>
    );
}

export default RecipeGridOneColumn;
