import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Box, Snackbar, Alert } from "@mui/material";
import "./BlogEditAdmin.css";

const BlogEditAdmin = ({ blog, onClose, onUpdated }) => {
    const [blogData, setBlogData] = useState({
        title: "",
        summary: "",
        content: "",
        author: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (blog) {
            setBlogData({
                title: blog.title || "",
                summary: blog.summary || "",
                content: blog.content || "",
                author: blog.author || "",
            });
            setImagePreview(blog.image || "");
        }
    }, [blog]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBlogData({ ...blogData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!blogData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
        if (!blogData.summary.trim()) newErrors.summary = "Tóm tắt là bắt buộc";
        if (!blogData.content.trim()) newErrors.content = "Nội dung là bắt buộc";
        if (!blogData.author.trim()) newErrors.author = "Tác giả là bắt buộc";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setFormError("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        setLoading(true);
        setFormError("");
        setSuccess("");

        try {
            let imageUrl = blog.image;
            if (imageFile) {
                const form = new FormData();
                form.append("image", imageFile);
                const res = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/blogs/upload-image`,
                    form,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                imageUrl = res.data.url;
            }

            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/blogs/${blog._id}`,
                { ...blogData, image: imageUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Cập nhật blog thành công!");
            if (onUpdated) onUpdated();
            if (onClose) onClose();
        } catch (err) {
            setFormError("Cập nhật blog thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="blog-edit-admin">
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
                <TextField
                    label="Tiêu đề"
                    name="title"
                    value={blogData.title}
                    onChange={handleInputChange}
                    required
                    error={!!errors.title}
                    helperText={errors.title}
                />
                <TextField
                    label="Tóm tắt"
                    name="summary"
                    value={blogData.summary}
                    onChange={handleInputChange}
                    required
                    error={!!errors.summary}
                    helperText={errors.summary}
                />
                <TextField
                    label="Nội dung"
                    name="content"
                    value={blogData.content}
                    onChange={handleInputChange}
                    required
                    multiline
                    minRows={4}
                    error={!!errors.content}
                    helperText={errors.content}
                />
                <TextField
                    label="Tác giả"
                    name="author"
                    value={blogData.author}
                    onChange={handleInputChange}
                    required
                    error={!!errors.author}
                    helperText={errors.author}
                />
                <TextField
                    label="Ngày tạo"
                    value={blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}
                    InputProps={{ readOnly: true }}
                    disabled
                />
                <TextField
                    label="Up date on"
                    value={blog?.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : ""}
                    InputProps={{ readOnly: true }}
                    disabled
                />
                <input
                    id="blog-image-upload-edit"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                />
                <label htmlFor="blog-image-upload-edit">
                    <Button variant="outlined" component="span">
                        Đổi ảnh
                    </Button>
                </label>
                {imagePreview && (
                    <img src={imagePreview} alt="preview" style={{ maxWidth: 200, marginTop: 8 }} />
                )}

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button onClick={onClose} color="inherit" disabled={loading}>
                        Huỷ
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        style={{ backgroundColor: "black", color: "white" }}
                    >
                        Lưu
                    </Button>
                </Box>
            </Box>
            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={() => setSuccess("")} severity="success" variant="filled">
                    {success}
                </Alert>
            </Snackbar>
            <Snackbar
                open={!!formError}
                autoHideDuration={4000}
                onClose={() => setFormError("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={() => setFormError("")} severity="error" variant="filled">
                    {formError}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default BlogEditAdmin;
