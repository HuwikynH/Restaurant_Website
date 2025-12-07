import React from "react";
import "./AdminBlogs.css";
import BlogTable from "../../../components/BlogTable/BlogTable";

function AdminBlogs() {
    return (
        <div className="admin-blogs-wrapper">
            <BlogTable />
        </div>
    );
}

export default AdminBlogs;
