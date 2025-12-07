import React, { useState, useEffect } from "react";
import "./CategoryEditAdmin.css";
import { TextField, Button, Alert, Snackbar, Typography, Box } from "@mui/material";

function CategoryEditAdmin({ category, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        displayName: "",
        image: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                displayName: category.displayName || "",
                image: category.image || "",
                description: category.description || "",
            });
        }
    }, [category]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData((prev) => ({
                ...prev,
                image: URL.createObjectURL(file),
            }));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setFormData((prev) => ({
            ...prev,
            image: "",
        }));
    };

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.displayName?.trim() || !formData.image?.trim()) {
            setErrorMessage("Vui lòng điền đầy đủ tất cả các trường.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            let uploadedImageUrl = formData.image;

            // 1. Nếu có ảnh mới → xóa ảnh cũ trong Cloudinary (monolith)
            if (imageFile && category.image) {
                await fetch(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/categories/${category._id}/images`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // 2. Upload ảnh mới nếu có (monolith)
            if (imageFile) {
                const form = new FormData();
                form.append("image", imageFile);

                const uploadRes = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/categories/upload-image?categoryId=${category._id}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: form,
                    }
                );

                const uploadData = await uploadRes.json();
                if (!uploadData.url) {
                    throw new Error("Upload ảnh thất bại");
                }

                uploadedImageUrl = uploadData.url;
            }

            // 3. Cập nhật lại danh mục trên product-service
            const updatedData = {
                name: formData.name,
                displayName: formData.displayName,
                description: formData.description,
                image: uploadedImageUrl,
            };

            const updateRes = await fetch(
                `${process.env.REACT_APP_PRODUCT_API_URL}/api/categories/${category._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedData),
                }
            );

            if (!updateRes.ok) throw new Error("Cập nhật thất bại");

            setSuccessMessage("Cập nhật danh mục thành công");
            onUpdateSuccess?.();
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            setErrorMessage("Không thể cập nhật danh mục");
        }
    };

    return (
        <div className="category-edit-admin-container">
            {/* Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => {
                    setSuccessMessage("");
                    onClose?.();
                }}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{ fontWeight: "bold", width: "100%" }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={4000}
                onClose={() => setErrorMessage("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity="error" variant="filled" sx={{ fontWeight: "bold", width: "100%" }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            {/* Header */}
            <div className="category-edit-admin-header">
                <h2>Sửa danh mục</h2>
            </div>

            <div className="category-edit-admin-form">
                <div className="main-image-section">
                    <h4>Ảnh đại diện</h4>
                    <label htmlFor="imageInput" style={{ cursor: "pointer" }}>
                        {formData.image ? (
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={formData.image}
                                    alt="Ảnh danh mục"
                                    style={{
                                        maxWidth: "100%",
                                        height: "120px",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveImage();
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: "-8px",
                                        right: "-8px",
                                        backgroundColor: "#4a4a48",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "22px",
                                        height: "22px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <p>Chưa có ảnh</p>
                        )}
                    </label>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                    />
                </div>

                <Box mt={2}>
                    <TextField
                        label="Tên Slug"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Tên hiển thị"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Mô tả (Có thể có hoặc không)"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        minRows={2}
                        margin="normal"
                    />
                </Box>
            </div>

            <div className="form-actions">
                <button className="cancel_button" onClick={onClose}>
                    HỦY
                </button>
                <button className="submit_button" onClick={handleSave}>
                    LƯU
                </button>
            </div>
        </div>
    );
}

export default CategoryEditAdmin;
