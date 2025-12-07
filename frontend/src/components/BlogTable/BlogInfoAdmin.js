import React from "react";
import "./BlogInfoAdmin.css";

const BlogInfoAdmin = ({ blog }) => {
    if (!blog) return <div>Đang tải...</div>;
    return (
        <div className="blog-info-admin-container">
            <h2 className="blog-title">{blog.title}</h2>
            <div className="blog-meta">
                <span>Tác giả: {blog.author}</span><br/>
                <span>Ngày tạo: {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}</span><br/>
                <span>Up date on: {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : ""}</span>
            </div>
            <div className="blog-summary" style={{ marginBottom: 12 }}><b>Tóm tắt:</b> {blog.summary}</div>
            {blog.image && (
                <div className="blog-image">
                    <img src={blog.image} alt={blog.title} style={{ maxWidth: 400, borderRadius: 8 }} />
                </div>
            )}
            <div className="blog-content" style={{ marginTop: 16 }}>
                <b>Nội dung:</b> {blog.content}
            </div>
        </div>
    );
};

export default BlogInfoAdmin; 