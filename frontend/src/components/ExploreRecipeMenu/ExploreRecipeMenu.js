import React from "react";
import "./ExploreRecipeMenu.css";

import ExploreRecipeMenuList from "../ExploreRecipeMenuList/ExploreRecipeMenuList";

function ExploreRecipeMenu({ category, setCategory, categoryList }) {
    return (
        <div className="explore-recipe-menu" id="explore-recipe-menu">
            <h2>Khám phá danh mục</h2>
            <ExploreRecipeMenuList
                list={categoryList}
                category={category}
                setCategory={setCategory}
            />
        </div>
    );
}

export default ExploreRecipeMenu;
