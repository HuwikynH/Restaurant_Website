import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../utils/axios";
import BlogReviewSection from "../../../components/BlogReviewSection/BlogReviewSection";
import "./BlogDetail.css";

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`)
            .then((res) => setBlog(res.data))
            .catch((err) => console.error(err));
    }, [id]);

    if (!blog) return <div>Đang tải...</div>;

    return (
        <div className="blog-detail-container">
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-desc">{blog.summary}</div>
            <div className="blog-meta">
                <span>
                    Submitted by <b>{blog.author}</b>
                </span>
                <span className="blog-date">
                    {" "}
                    | Updated on {new Date(blog.createdAt).toLocaleDateString()}
                </span>
            </div>
            <div className="blog-actions">{/* Thêm các nút khác nếu muốn */}</div>
            {blog.image && (
                <div className="blog-image">
                    <img src={blog.image} alt={blog.title} />
                </div>
            )}
            <div className="blog-content">{blog.content}</div>
            <BlogReviewSection blogId={blog._id} />
        </div>
    );
};

export default BlogDetail;
