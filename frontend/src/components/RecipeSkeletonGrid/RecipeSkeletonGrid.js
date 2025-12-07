import React from "react";
import "./RecipeSkeletonGrid.css";

import RecipeSkeletonCard from "../RecipeSkeletonCard/RecipeSkeletonCard";

function RecipeSkeletonGrid({ number = 4 }) {
    return (
        <div className="recipe-skeleton-grid-wrapper">
            <div className="card-container">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                    {Array.from({ length: number }).map((_, index) => (
                        <RecipeSkeletonCard key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RecipeSkeletonGrid;
