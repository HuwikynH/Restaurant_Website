import React from "react";
import { Link } from "react-router-dom";
import "./BlogPostCard.css";

const BlogPostCard = ({ blog = {} }) => {
    if (!blog || !blog._id) {
        return (
            <div className="blog-post-card blog-post-card-placeholder">
                <div className="blog-post-card-image-placeholder"></div>
                <div className="blog-post-card-content">
                    <h3 className="blog-post-card-title">Đang tải...</h3>
                    <div className="blog-post-card-date"></div>
                    <div className="blog-post-card-summary"></div>
                    <div className="blog-post-card-desc"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-post-card">
            <Link to={`/blogs/${blog._id}`} className="blog-post-card-image-link">
                <img 
                    className="blog-post-card-image" 
                    src={blog.image} 
                    alt={blog.title || 'Blog post image'} 
                />
            </Link>
            <div className="blog-post-card-content">
                <Link to={`/blogs/${blog._id}`} className="blog-post-card-title-link">
                    <h3 className="blog-post-card-title">{blog.title?.toUpperCase()}</h3>
                </Link>
                <div className="blog-post-card-date">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("vi-VN") : ""}
                </div>
                <div className="blog-post-card-summary">{blog.summary}</div>
                <div className="blog-post-card-desc">{blog.content?.slice(0, 120)}...</div>
            </div>
        </div>
    );
};

export default BlogPostCard; 