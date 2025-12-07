import React from "react";
import "./ExploreRecipeMenuList.css";

function ExploreRecipeMenuList({ list, category, setCategory }) {
    return (
        <div className="explore-recipe-menu-list">
            {list.map((item) => (
                <div
                    onClick={() => setCategory((prev) => (prev === item.name ? "All" : item.name))}
                    key={item._id}
                    className="explore-menu-item"
                >
                    <img
                        loading="lazy"
                        className={category === item.name ? "active" : ""}
                        src={item.image}
                        alt="Food image"
                    />
                    <p>{item.displayName}</p>
                </div>
            ))}
        </div>
    );
}

export default React.memo(ExploreRecipeMenuList);
