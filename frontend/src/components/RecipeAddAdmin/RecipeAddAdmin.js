// RecipeAddAdmin.jsx
import React, { useState, useEffect } from "react";
import "./RecipeAddAdmin.css";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

function RecipeAddAdmin({ onClose, onUpdateSuccess }) {
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_PRODUCT_API_URL}/api/categories`
                );
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy danh mục:", err);
            }
        };

        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        ingredients: "",
        steps: "",
        category: "",
        imageThumb: "",
        images: [],
        cookingTime: "",
        serves: 0,
        calories: 0,
        origin: "",
        videoUrl: "",
        tags: "",
        price: 0,
        imageThumbFile: null,
        subImageFiles: [],
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleChangeMainImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                imageThumb: reader.result,
                imageThumbFile: file,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddSubImages = (e) => {
        const files = Array.from(e.target.files);
        const previews = [];

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push({ url: reader.result, file });

                if (previews.length === files.length) {
                    setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...previews.map((p) => p.url)],
                        subImageFiles: [...prev.subImageFiles, ...previews.map((p) => p.file)],
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const mainImage = formData.imageThumb;
    const subImages = Array.isArray(formData.images)
        ? formData.images.filter((img) => img !== formData.imageThumb)
        : [];

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        if (
            !formData.title?.trim() ||
            !formData.description?.trim() ||
            !formData.ingredients?.trim() ||
            !formData.steps?.trim() ||
            !formData.cookingTime?.trim() ||
            !formData.serves ||
            !formData.calories ||
            formData.price === null ||
            formData.price === undefined ||
            Number(formData.price) < 0 ||
            !formData.origin?.trim() ||
            !formData.videoUrl?.trim() ||
            !formData.tags?.trim() ||
            !formData.category
        ) {
            setErrorMessage("Vui lòng điền đầy đủ tất cả các trường.");
            setSaving(false);
            return;
        }

        if (!Array.isArray(formData.images) || formData.images.length === 0) {
            setErrorMessage("Vui lòng thêm ít nhất 1 ảnh cho món ăn.");
            return;
        }

        try {
            // 1. Tạo công thức ban đầu trong product-service để lấy _id cho folder Cloudinary
            const createRes = await axios.post(
                `${process.env.REACT_APP_PRODUCT_API_URL}/api/recipes`,
                {
                    title: formData.title?.trim(),
                    category: formData.category,
                    isApproved: false,
                    price: Number(formData.price) || 0,
                }
            );
            const recipeId = createRes.data._id;

            let imageThumbUrl = "";
            let uploadedSubImages = [];

            // 2. Upload ảnh đại diện nếu có
            if (formData.imageThumbFile) {
                const form = new FormData();
                form.append("image", formData.imageThumbFile);

                const res = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/recipes/upload-image?recipeId=${recipeId}`,
                    form,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                imageThumbUrl = res.data.url;
            }

            // 3. Upload ảnh phụ nếu có
            if (formData.subImageFiles?.length > 0) {
                for (const file of formData.subImageFiles) {
                    const form = new FormData();
                    form.append("image", file);

                    const res = await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/cloudinary/recipes/upload-image?recipeId=${recipeId}`,
                        form,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );
                    uploadedSubImages.push(res.data.url);
                }
            }

            // 4. Cập nhật công thức với đầy đủ dữ liệu lên product-service
            const updatedData = {
                title: formData.title?.trim(),
                description: formData.description?.trim(),
                cookingTime: formData.cookingTime?.trim(),
                serves: Number(formData.serves),
                calories: Number(formData.calories),
                origin: formData.origin?.trim(),
                videoUrl: formData.videoUrl?.trim(),
                ingredients: formData.ingredients
                    .split("\n")
                    .map((i) => i.trim())
                    .filter(Boolean),
                steps: formData.steps
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                tags: formData.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                price: Number(formData.price) || 0,
                imageThumb: imageThumbUrl,
                images: uploadedSubImages,
                category: formData.category,
            };

            await axios.put(
                `${process.env.REACT_APP_PRODUCT_API_URL}/api/recipes/${recipeId}`,
                updatedData
            );

            setSuccessMessage("Đã thêm công thức thành công!");
            onUpdateSuccess?.();
        } catch (error) {
            console.error("Lỗi thêm công thức:", error);
            setErrorMessage("Không thể thêm công thức.");
        }
        setSaving(false);
    };

    return (
        <div className="recipe-edit-admin-container">
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
                    sx={{ width: "100%", fontWeight: "bold" }}
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
                <Alert severity="error" variant="filled" sx={{ width: "100%", fontWeight: "bold" }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            <div className="recipe-edit-admin-header">
                <h1>Thêm công thức</h1>
            </div>
            <div className="recipe-edit-admin-form">
                <div className="image-upload-section">
                    {/* Ảnh đại diện */}
                    <div className="main-image-section">
                        <h4>Ảnh đại diện</h4>
                        <label
                            htmlFor="imageThumbInput"
                            style={{ display: "block", cursor: "pointer" }}
                        >
                            {mainImage ? (
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <img
                                        src={mainImage}
                                        alt="Ảnh đại diện"
                                        style={{
                                            maxWidth: "100%",
                                            height: "120px",
                                            objectFit: "cover",
                                            borderRadius: "10px",
                                            marginBottom: "10px",
                                        }}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFormData((prev) => ({
                                                ...prev,
                                                imageThumb: "",
                                                imageThumbFile: null,
                                            }));
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
                                <p>Chưa có ảnh đại diện</p>
                            )}
                        </label>
                        <input
                            id="imageThumbInput"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleChangeMainImage}
                        />
                    </div>

                    {/* Ảnh phụ */}
                    <div className="sub-images-section">
                        <h4>Ảnh phụ</h4>
                        <label
                            htmlFor="subImagesInput"
                            style={{ cursor: "pointer", marginTop: "10px" }}
                        >
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {subImages.length > 0 ? (
                                    subImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                position: "relative",
                                                display: "inline-block",
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Ảnh phụ ${idx + 1}`}
                                                style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        images: prev.images.filter(
                                                            (i) => i !== img
                                                        ),
                                                        subImageFiles: (
                                                            prev.subImageFiles || []
                                                        ).filter(
                                                            (f, iIdx) =>
                                                                prev.images.indexOf(img) !== iIdx
                                                        ),
                                                    }));
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: "-5px",
                                                    right: "-5px",
                                                    backgroundColor: "#4a4a48",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    width: "20px",
                                                    height: "20px",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>Chưa có ảnh phụ</p>
                                )}
                            </div>
                        </label>
                        <input
                            type="file"
                            id="subImagesInput"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleAddSubImages}
                        />
                    </div>
                </div>

                <div className="recipe-details-section">
                    <div className="form-group">
                        <label htmlFor="title">Tiêu đề món ăn</label>
                        <input type="text" id="title" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea id="description" onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="ingredients">Nguyên liệu (mỗi nguyên liệu 1 dòng)</label>
                        <textarea id="ingredients" onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="steps">Hướng dẫn (mỗi bước 1 dòng)</label>
                        <textarea id="steps" onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="cookingTime">Thời gian nấu</label>
                        <input type="text" id="cookingTime" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="serves">Khẩu phần</label>
                        <input type="number" id="serves" min="0" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="calories">Calories</label>
                        <input type="number" id="calories" min="0" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Giá món ăn (đ)</label>
                        <input
                            type="number"
                            id="price"
                            min="0"
                            value={formData.price}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="origin">Nguồn gốc</label>
                        <input type="text" id="origin" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="videoUrl">Video URL</label>
                        <input type="text" id="videoUrl" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
                        <input type="text" id="tags" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Danh mục</label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                }))
                            }
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button className="cancel_button" onClick={onClose} disabled={saving}>
                    HỦY
                </button>
                <button className="submit_button" onClick={handleSave} disabled={saving}>
                    {saving ? "ĐANG LƯU..." : "LƯU"}
                </button>
            </div>
        </div>
    );
}

export default RecipeAddAdmin;
