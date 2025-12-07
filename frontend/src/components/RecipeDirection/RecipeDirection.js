import React from "react";
import "./RecipeDirection.css";

function RecipeDirection({ steps }) {
    return (
        <div className="recipe-direction-wrapper">
            <h3 className="title">Hướng dẫn</h3>
            <ol className="direction-list">
                {steps?.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>
        </div>
    );
}

export default RecipeDirection;
