import React from "react";
import "./RecipeIngredient.css";

function RecipeIngredient({ ingredients }) {
    return (
        <div className="recipe-ingredient-wrapper">
            <h3 className="title">Nguyên liệu</h3>
            <ul className="ingredient-list">
                {ingredients?.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
        </div>
    );
}

export default RecipeIngredient;
