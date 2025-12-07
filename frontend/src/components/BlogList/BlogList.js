import React, { useEffect, useState } from "react";
import BlogPostCard from "../BlogPostCard/BlogPostCard";
import axios from "../../utils/axios";
import "./BlogList.css";

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get("/api/blogs");
                console.log("Blog data:", response.data); // Để debug
                setBlogs(response.data.blogs);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="blog-list-wrapper">
                <h2 className="blog-list-title">Bài Viết Mới</h2>
                <div className="blog-list-grid">
                    {[1, 2, 3].map((_, index) => (
                        <div key={index} className="blog-post-card-placeholder">
                            <div className="blog-post-card-image-placeholder"></div>
                            <div className="blog-post-card-content">
                                <div className="blog-post-card-title"></div>
                                <div className="blog-post-card-date"></div>
                                <div className="blog-post-card-summary"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="blog-list-wrapper">
            <h2 className="blog-list-title">Bài Viết Mới</h2>
            <div className="blog-list-grid">
                {blogs && blogs.length > 0 ? (
                    blogs.map((blog) => (
                        <BlogPostCard key={blog._id} blog={blog} />
                    ))
                ) : (
                    <div className="no-blogs-message">Chưa có bài viết nào.</div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
