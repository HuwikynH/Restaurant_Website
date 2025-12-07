import React, { useState, useEffect, useRef } from "react";
import "./AddRecipe.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Define backend API base URL

function AddRecipe() {
  const navigate = useNavigate();
  const { id: recipeId } = useParams();

  // Refs for scrolling to missing fields
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const ingredientsRef = useRef(null);
  const stepsRef = useRef(null);
  const imageUploadRef = useRef(null);
  const cookingTimeRef = useRef(null);
  const servesRef = useRef(null);
  const caloriesRef = useRef(null);
  const originRef = useRef(null);
  const videoUrlRef = useRef(null);
  const categoryRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    images: [],
    videoUrl: "",
    category: "",
    categoryDisplay: "",
    cookingTime: "",
    serves: 0,
    calories: 0,
    origin: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productBase = process.env.REACT_APP_PRODUCT_API_URL;
        if (!productBase) {
          throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
        }

        const response = await axios.get(
          `${productBase}/api/categories`
        );
        setCategories(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories from product-service:", err);
        setError("Không thể tải danh mục.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (recipeId) {
      setIsEditing(true);
      const fetchRecipe = async () => {
        setLoading(true);
        setError(null);
        try {
          const productBase = process.env.REACT_APP_PRODUCT_API_URL;
          if (!productBase) {
            throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
          }

          const response = await axios.get(
            `${productBase}/api/recipes/${recipeId}`
          );

          const data = response.data || {};

          setFormData({
            title: data.title || "",
            description: data.description || "",
            ingredients:
              (Array.isArray(data.ingredients)
                ? data.ingredients.join("\n")
                : data.ingredients || "") || "",
            steps:
              (Array.isArray(data.steps)
                ? data.steps.join("\n")
                : data.steps || "") || "",
            images: data.images || [],
            videoUrl: data.videoUrl || "",
            category: data.category || "",
            categoryDisplay:
              (data.category && data.category.displayName) ||
              data.categoryDisplay ||
              "",
            cookingTime: data.cookingTime || "",
            serves: data.serves || 0,
            calories: data.calories || 0,
            origin: data.origin || "",
          });
          setLoading(false);
        } catch (err) {
          console.error("Error fetching recipe for editing:", err);
          setError("Không thể tải dữ liệu công thức.");
          setLoading(false);
        }
      };
      fetchRecipe();
    } else {
      setIsEditing(false);
      // Reset form for adding new recipe
      setFormData({
        title: "",
        description: "",
        ingredients: "",
        steps: "",
        images: [],
        videoUrl: "",
        category: "",
        categoryDisplay: "",
        cookingTime: "",
        serves: 0,
        calories: 0,
        origin: "",
      });
    }
  }, [recipeId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "category") {
      const selectedCategory = categories.find((cat) => cat._id === value);
      setFormData((prevData) => ({
        ...prevData,
        category: value,
        categoryDisplay: selectedCategory ? selectedCategory.displayName : "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentImagesCount = formData.images.length;
    const newImagesCount = files.length;

    if (currentImagesCount + newImagesCount > 6) {
      setUploadError("Chỉ được tải lên tối đa 6 ảnh.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const uploadedUrls = [...formData.images];

    try {
      for (const file of files) {
        const formDataToSend = new FormData();
        formDataToSend.append("image", file);

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/upload`,
          formDataToSend,
          config
        );
        uploadedUrls.push(response.data.url);
      }
      setFormData((prevData) => ({
        ...prevData,
        images: uploadedUrls,
        imageThumb: uploadedUrls.length > 0 ? uploadedUrls[0] : "",
      }));
      console.log("Images uploaded successfully:", uploadedUrls);
    } catch (err) {
      console.error("Error uploading image:", err);
      setUploadError("Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prevData) => {
      const newImages = prevData.images.filter(
        (_, index) => index !== indexToRemove
      );
      return {
        ...prevData,
        images: newImages,
        imageThumb: newImages.length > 0 ? newImages[0] : "",
      };
    });
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  const validateForm = () => {
    const {
      title,
      description,
      ingredients,
      steps,
      images,
      cookingTime,
      serves,
      calories,
      origin,
      videoUrl,
      category,
    } = formData;

    if (!images || images.length === 0) {
      setError("Vui lòng tải lên ít nhất 01 ảnh.");
      return imageUploadRef;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề món ăn.");
      return titleRef;
    }
    if (!description.trim()) {
      setError("Vui lòng nhập mô tả.");
      return descriptionRef;
    }
    if (!ingredients.trim()) {
      setError("Vui lòng nhập nguyên liệu.");
      return ingredientsRef;
    }
    if (!steps.trim()) {
      setError("Vui lòng nhập hướng dẫn.");
      return stepsRef;
    }
    if (!cookingTime.trim()) {
      setError("Vui lòng nhập thời gian nấu.");
      return cookingTimeRef;
    }
    if (parseInt(serves) <= 0) {
      setError("Khẩu phần phải lớn hơn 0.");
      return servesRef;
    }
    if (parseInt(calories) <= 0) {
      setError("Calories phải lớn hơn 0.");
      return caloriesRef;
    }
    if (!origin.trim()) {
      setError("Vui lòng nhập nguồn gốc.");
      return originRef;
    }
    if (!videoUrl.trim()) {
      setError("Vui lòng nhập URL video.");
      return videoUrlRef;
    }
    if (!category || (typeof category === "string" && !category.trim())) {
      setError("Vui lòng chọn danh mục.");
      return categoryRef;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    const validationResult = validateForm();
    if (validationResult !== true) {
      if (validationResult && validationResult.current) {
        validationResult.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dataToSend = {
        ...formData,
        ingredients: formData.ingredients
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        steps: formData.steps
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        serves: parseInt(formData.serves) || 0,
        calories: parseInt(formData.calories) || 0,
      };

      if (isEditing) {
        const productBase = process.env.REACT_APP_PRODUCT_API_URL;
        if (!productBase) {
          throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
        }

        await axios.put(
          `${productBase}/api/recipes/${recipeId}`,
          dataToSend
        );

        console.log("Công thức đã được cập nhật.");
        setNotification({
          message: "Công thức đã được cập nhật thành công!",
          type: "success",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          setNotification({ message: null, type: null });
          navigate("/my-recipes");
        }, 2000);
      } else {
        const productBase = process.env.REACT_APP_PRODUCT_API_URL;
        if (!productBase) {
          throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
        }

        await axios.post(`${productBase}/api/recipes`, dataToSend);

        console.log("Công thức mới đã được tạo.");
        setNotification({
          message: "Công thức mới được tạo thành công - Chờ duyệt!",
          type: "success",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          setNotification({ message: null, type: null });
          navigate("/my-recipes");
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting recipe:", err);
      setError("Không thể lưu công thức.");
      setNotification({
        message: "Không thể lưu công thức. Vui lòng thử lại.",
        type: "error",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setNotification({ message: null, type: null }), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-recipe-container">
      <div className="add-recipe-header">
        <h1>{isEditing ? "Chỉnh sửa công thức" : "Thêm công thức mới"}</h1>
      </div>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="add-recipe-form">
        <div className="image-upload-section">
          <input
            type="file"
            id="imageFile"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          {/* The main clickable label for image upload */}
          <label
            htmlFor="imageFile"
            className="upload-box-main"
            ref={imageUploadRef}
          >
            {uploading ? (
              <p>Đang tải ảnh...</p>
            ) : uploadError ? (
              <p className="error-message">{uploadError}</p>
            ) : formData.images && formData.images.length > 0 ? (
              <div className="uploaded-images-preview-wrapper">
                <div className="uploaded-images-preview">
                  {formData.images.map((imgSrc, index) => (
                    <div key={index} className="image-preview-item">
                      <img
                        src={imgSrc}
                        alt={`Uploaded ${index + 1}`}
                        className="uploaded-thumbnail"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                {formData.images.length < 6 && (
                  <div className="add-more-images">
                    <i className="fas fa-plus"></i>
                    <p>Thêm ảnh ({formData.images.length}/6)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="initial-upload-content">
                <i className="fas fa-camera"></i>
                <p>ĐĂNG TỪ 01 ĐẾN 06 HÌNH</p>
                <p className="upload-call-to-action">Click để tải ảnh lên</p>
              </div>
            )}
          </label>
        </div>

        <div className="recipe-details-section">
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="warning-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>Vui lòng điền đầy đủ trước khi Đăng tải</p>
          </div>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề món ăn</label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              ref={titleRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              ref={descriptionRef}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="ingredients">
              Nguyên liệu (mỗi nguyên liệu 1 dòng)
            </label>
            <textarea
              id="ingredients"
              required
              value={formData.ingredients}
              onChange={handleInputChange}
              ref={ingredientsRef}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="steps">Hướng dẫn (mỗi bước 1 dòng)</label>
            <textarea
              id="steps"
              required
              value={formData.steps}
              onChange={handleInputChange}
              ref={stepsRef}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="cookingTime">Thời gian nấu</label>
            <input
              type="text"
              id="cookingTime"
              required
              value={formData.cookingTime}
              onChange={handleInputChange}
              ref={cookingTimeRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="serves">Khẩu phần</label>
            <input
              type="number"
              id="serves"
              value={formData.serves}
              required
              onChange={handleInputChange}
              ref={servesRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="calories">Calories</label>
            <input
              type="number"
              id="calories"
              required
              value={formData.calories}
              onChange={handleInputChange}
              ref={caloriesRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="origin">Nguồn gốc</label>
            <input
              type="text"
              id="origin"
              required
              value={formData.origin}
              onChange={handleInputChange}
              ref={originRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="videoUrl">Video URL</label>
            <input
              type="text"
              id="videoUrl"
              required
              value={formData.videoUrl}
              onChange={handleInputChange}
              ref={videoUrlRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Danh mục</label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              ref={categoryRef}
              required
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
        <button className="cancel_button" onClick={handleCancel}>
          HỦY
        </button>
        <button className="submit_button" onClick={handleSubmit}>
          ĐĂNG TẢI
        </button>
      </div>
    </div>
  );
}

export default AddRecipe;
