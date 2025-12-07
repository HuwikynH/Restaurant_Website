import React, { useState } from "react";
import "./CategoryAddAdmin.css";
import { TextField, Snackbar, Alert, Box } from "@mui/material";

function CategoryAddAdmin({ onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        displayName: "",
        image: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setFormData((prev) => ({ ...prev, image: "" }));
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            // 1. Tạo danh mục mới (chưa có ảnh) trên product-service
            const createRes = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/api/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    displayName: formData.displayName,
                    description: formData.description,
                }),
            });

            if (!createRes.ok) throw new Error("Tạo danh mục thất bại");

            const createdCategory = await createRes.json(); // chứa _id
            const categoryId = createdCategory._id;
            let uploadedImageUrl = "";

            // 2. Nếu có ảnh thì upload vào thư mục categories/:id
            if (imageFile) {
                const imgForm = new FormData();
                imgForm.append("image", imageFile);

                const uploadRes = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/categories/upload-image?categoryId=${categoryId}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: imgForm,
                    }
                );

                const uploadData = await uploadRes.json();
                if (!uploadData.url) throw new Error("Upload ảnh thất bại");

                uploadedImageUrl = uploadData.url;

                // 3. Gửi lại request PUT để cập nhật ảnh trên product-service
                await fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/api/categories/${categoryId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ image: uploadedImageUrl }),
                });
            }

            setSuccessMessage("Tạo danh mục thành công");
            onUpdateSuccess?.();
        } catch (error) {
            console.error(error);
            setErrorMessage("Không thể tạo danh mục");
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

            <div className="category-edit-admin-header">
                <h2>Thêm danh mục</h2>
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
                        label="Mô tả"
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
                    THÊM
                </button>
            </div>
        </div>
    );
}

export default CategoryAddAdmin;
