import React, { useEffect, useState } from "react";
import "./RecipeEditAdmin.css";
import axios from "axios";
import { Snackbar, Alert, Button } from "@mui/material";

function RecipeEditAdmin({ recipe, onClose, onUpdateSuccess }) {
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState([]);
    // get all categories
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
        imageThumb: "",
        cookingTime: "",
        serves: 0,
        calories: 0,
        origin: "",
        videoUrl: "",
        tags: "",
        category: "",
        isApproved: false,
        price: 0,
    });

    useEffect(() => {
        if (recipe) {
            setFormData({
                title: recipe.title || "",
                description: recipe.description || "",
                ingredients: recipe.ingredients?.join("\n") || "",
                steps: recipe.steps?.join("\n") || "",
                imageThumb: recipe.imageThumb || "",
                images: recipe.images || "",
                cookingTime: recipe.cookingTime || "",
                serves: recipe.serves || 0,
                calories: recipe.calories || 0,
                origin: recipe.origin || "",
                category:
                    typeof recipe.category === "object"
                        ? recipe.category._id
                        : recipe.category || "",
                videoUrl: recipe.videoUrl || "",
                tags: recipe.tags?.join(", ") || "",
                isApproved: recipe.isApproved || false,
                price: typeof recipe.price === "number" ? recipe.price : 0,
            });
        }
    }, [recipe]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleChangeMainImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            // Lưu URL tạm thời (base64) để hiển thị preview
            setFormData((prev) => ({
                ...prev,
                imageThumb: reader.result,
                imageThumbFile: file, // lưu lại file để upload sau
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

                // Khi tất cả ảnh đã đọc xong thì cập nhật state
                if (previews.length === files.length) {
                    setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...previews.map((p) => p.url)],
                        subImageFiles: [
                            ...(prev.subImageFiles || []),
                            ...previews.map((p) => p.file),
                        ],
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleCancel = () => {
        if (onClose) onClose();
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
            !formData.origin?.trim() ||
            !formData.videoUrl?.trim() ||
            !formData.tags?.trim() ||
            !formData.category ||
            !formData.price ||
            Number(formData.price) <= 0
        ) {
            setErrorMessage("Vui lòng điền đầy đủ tất cả các trường.");
            setSaving(false);
            return;
        }
        try {
            const recipeId = recipe._id;

            const originalImages = recipe.images || [];
            const currentImages = formData.images || [];

            // Phân loại ảnh:
            const deletedImages = originalImages.filter((img) => !currentImages.includes(img));
            const base64NewImages = currentImages.filter((img) => img.startsWith("data:image"));
            const unchangedImages = currentImages.filter((img) => !img.startsWith("data:image"));

            let updatedImageUrls = [...unchangedImages];

            // xóa ảnh phụ cũ đã bị xóa
            if (deletedImages.length > 0) {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/recipes/${recipeId}/delete-images`,
                    { publicUrls: deletedImages }
                );
            }

            // Upload ảnh phụ mới (base64)
            for (const base64 of base64NewImages) {
                const blob = await (await fetch(base64)).blob();
                const form = new FormData();
                form.append(
                    "image",
                    new File([blob], `new-${Date.now()}.jpg`, { type: blob.type })
                );

                const res = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/cloudinary/recipes/upload-image?recipeId=${recipeId}`,
                    form,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                updatedImageUrls.push(res.data.url);
            }

            // Upload ảnh đại diện nếu có thay đổi
            let imageThumbUrl = recipe.imageThumb;
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

            // Tạo dữ liệu cập nhật
            const updatedData = {
                title: formData.title?.trim(),
                description: formData.description?.trim(),
                cookingTime: formData.cookingTime?.trim(),
                serves: Number(formData.serves),
                calories: Number(formData.calories),
                origin: formData.origin?.trim(),
                videoUrl: formData.videoUrl?.trim(),
                price: Number(formData.price) || 0,
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
                imageThumb: imageThumbUrl,
                images: updatedImageUrls,
                category: formData.category,
                isApproved: formData.isApproved,
            };

            //Gửi PUT cập nhật lên product-service
            await axios.put(
                `${process.env.REACT_APP_PRODUCT_API_URL}/api/recipes/${recipeId}`,
                updatedData
            );

            setSuccessMessage("Đã cập nhật công thức thành công!");
            onUpdateSuccess?.();
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            setErrorMessage("Có lỗi khi cập nhật công thức hoặc ảnh.");
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
                    onClose={() => setSuccessMessage("")}
                    severity="success"
                    variant="filled" //
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
                <Alert
                    onClose={() => setErrorMessage("")}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%", fontWeight: "bold" }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
            <div className="recipe-edit-admin-header">
                <h1>Chỉnh sửa công thức</h1>
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
                                    <p>Không có ảnh phụ</p>
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
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="ingredients">Nguyên liệu (mỗi nguyên liệu 1 dòng)</label>
                        <textarea
                            id="ingredients"
                            value={formData.ingredients}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="steps">Hướng dẫn (mỗi bước 1 dòng)</label>
                        <textarea
                            id="steps"
                            value={formData.steps}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="cookingTime">Thời gian nấu</label>
                        <input
                            type="text"
                            id="cookingTime"
                            value={formData.cookingTime}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="serves">Khẩu phần</label>
                        <input
                            type="number"
                            id="serves"
                            min="0"
                            value={formData.serves}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="calories">Calories</label>
                        <input
                            type="number"
                            id="calories"
                            min="0"
                            value={formData.calories}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Giá (VNĐ)</label>
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
                        <input
                            type="text"
                            id="origin"
                            value={formData.origin}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="videoUrl">Video URL</label>
                        <input
                            type="text"
                            id="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
                        <input
                            type="text"
                            id="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                        />
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

                    <div className="form-group">
                        <label htmlFor="isApproved">Trạng thái phê duyệt</label>
                        <select
                            id="isApproved"
                            value={formData.isApproved ? "true" : "false"}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    isApproved: e.target.value === "true",
                                }))
                            }
                        >
                            <option value="true">Đã duyệt</option>
                            <option value="false">Chờ duyệt</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-actions" style={{ gap: "30px" }}>
                <button className="cancel_button" onClick={handleCancel} disabled={saving}>
                    HỦY
                </button>
                {/* <Button
                    variant="text"
                    sx={{
                        marginRight: "20px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        boxShadow: "none",
                        backgroundColor: "none",
                    }}
                >
                    HỦY
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: "12px",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        boxShadow: 2,
                        backgroundColor: "#4a4a48",
                        "&:hover": {
                            backgroundColor: "black",
                        },
                    }}
                >
                    THÊM
                </Button> */}
                <button className="submit_button" onClick={handleSave} disabled={saving}>
                    {saving ? "ĐANG LƯU..." : "LƯU"}
                </button>
            </div>
        </div>
    );
}

export default RecipeEditAdmin;
