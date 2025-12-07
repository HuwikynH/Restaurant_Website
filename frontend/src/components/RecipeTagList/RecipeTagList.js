import React from "react";
import "./RecipeTagList.css";
import RecipeTag from "../RecipeTag/RecipeTag";

function RecipeTagList({ tags = [] }) {
    return (
        <div className="recipe-tag-list-wrapper">
            <h5 className="title">Khám phá</h5>
            <div className="recipe-tag-list">
                {tags.map((tag, index) => (
                    <RecipeTag
                        key={index}
                        name={tag}
                        link={`/search?query=${encodeURIComponent(tag)}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default RecipeTagList;
