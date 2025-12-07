import React from "react";
import "./AdminRecipes.css";
import RecipeTable from "../../../components/RecipeTable/RecipeTable";

function AdminRecipes() {
    return (
        <div className="admin-recipes-wrapper">
            <div className="content">
                <RecipeTable />
            </div>
        </div>
    );
}

export default AdminRecipes;
