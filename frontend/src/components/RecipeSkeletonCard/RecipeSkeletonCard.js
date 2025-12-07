import React from "react";
import "./RecipeSkeletonCard.css"; // Dùng lại style

function RecipeSkeletonCard() {
    return (
        <div className="recipe-skeleton-card-wrapper">
            <div className="col">
                <div className="card">
                    <div className="skeleton-img" />
                    <div className="card-body">
                        <div className="card-title" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeSkeletonCard;
