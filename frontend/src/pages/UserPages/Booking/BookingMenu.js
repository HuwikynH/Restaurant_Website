import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid";
import axios from "axios";

const StepHeader = ({ currentStep, onStepClick }) => {
    const steps = [
        { id: 1, label: "Chọn chi nhánh" },
        { id: 2, label: "Chọn ngày & giờ" },
        { id: 3, label: "Chọn tầng & bàn" },
        { id: 4, label: "Chọn menu" },
        { id: 5, label: "Xác nhận & thanh toán" },
    ];

    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
                {steps.map((s, index) => {
                    const isDone = currentStep > s.id;
                    const isActive = currentStep === s.id;
                    const isFuture = currentStep < s.id;
                    const isClickable = isDone && typeof onStepClick === "function";
                    return (
                        <div
                            key={s.id}
                            className="d-flex align-items-center mb-2"
                            style={{
                                minWidth: 0,
                                cursor: isClickable ? "pointer" : "default",
                            }}
                            onClick={isClickable ? () => onStepClick(s.id) : undefined}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 8,
                                    backgroundColor: isActive
                                        ? "#8b5e3c"
                                        : isDone
                                        ? "#a97155"
                                        : "#e9ecef",
                                    color: isActive || isDone ? "#fff" : "#6c757d",
                                    fontWeight: 600,
                                }}
                            >
                                {isDone ? "✓" : s.id}
                            </div>
                            <span
                                style={{
                                    fontWeight: isActive ? 600 : 400,
                                    color: isFuture && !isActive ? "#6c757d" : "#212529",
                                }}
                            >
                                {s.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div
                                    style={{
                                        width: 30,
                                        height: 2,
                                        background: currentStep > s.id ? "#a97155" : "#e9ecef",
                                        marginLeft: 8,
                                    }}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BookingMenu = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(true);
    const [cart, setCart] = useState(null);
    const [loadingCart, setLoadingCart] = useState(false);
    const [categories, setCategories] = useState([]); // danh sách category từ backend
    const [selectedCategoryName, setSelectedCategoryName] = useState("ALL");

    const fetchCart = async () => {
        try {
            setLoadingCart(true);
            const res = await fetch(`http://localhost:8002/api/cart/${bookingId}`);
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không tải được giỏ món");
            }
            setCart(data.data);
        } catch (error) {
            console.error("Lỗi load cart:", error);
            toast.error("Không tải được giỏ món của bàn");
        } finally {
            setLoadingCart(false);
        }
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const productBase = process.env.REACT_APP_PRODUCT_API_URL;
                if (!productBase) {
                    throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
                }

                const res = await fetch(`${productBase}/api/recipes/approved`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Product service error");
                }
                const list = Array.isArray(data) ? data : data.data || [];

                setRecipes(list);
            } catch (error) {
                console.error("Lỗi load menu:", error);
                toast.error("Không tải được menu món ăn");
            } finally {
                setLoadingMenu(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const productBase = process.env.REACT_APP_PRODUCT_API_URL;
                if (!productBase) {
                    throw new Error("Chưa cấu hình REACT_APP_PRODUCT_API_URL");
                }

                const res = await axios.get(`${productBase}/api/categories`);
                const cats = Array.isArray(res.data) ? res.data : res.data.data || [];

                setCategories(cats);

                // Nếu có danh mục Set menu / Combo thì chọn mặc định khi vào bước này
                const comboCat = cats.find((cat) => {
                    const displayName = (cat.displayName || "").toLowerCase();
                    const name = (cat.name || "").toLowerCase();
                    return (
                        displayName.includes("set menu") ||
                        displayName.includes("combo") ||
                        name.includes("set menu") ||
                        name.includes("combo")
                    );
                });

                if (comboCat) {
                    setSelectedCategoryName(comboCat.name);
                }
            } catch (error) {
                console.error("Lỗi load danh mục:", error);
            }
        };

        fetchRecipes();
        fetchCategories();
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId]);

    const handleAddToBooking = async (recipe) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?._id || "test-user-1";

            const res = await fetch(`http://localhost:8002/api/cart/${bookingId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    productId: recipe._id,
                    name: recipe.title,
                    price: recipe.price || 0,
                    quantity: 1,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không thêm được món vào bàn");
            }

            toast.success("Đã thêm món vào bàn!");
            // cập nhật lại cart hiển thị
            await fetchCart();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Có lỗi xảy ra");
        }
    };

    if (loadingMenu) {
        return <div className="container my-5">Đang tải menu...</div>;
    }

    // Tìm danh mục dành riêng cho Set menu / Combo (đã tạo sẵn trong admin)
    const comboCategory = categories.find((cat) => {
        const displayName = (cat.displayName || "").toLowerCase();
        const name = (cat.name || "").toLowerCase();
        return (
            displayName.includes("set menu") ||
            displayName.includes("combo") ||
            name.includes("set menu") ||
            name.includes("combo")
        );
    });

    // Helper: lấy id category từ recipe (có thể là string hoặc object)
    const getRecipeCategoryId = (recipe) => {
        if (!recipe || !recipe.category) return null;
        if (typeof recipe.category === "string") return recipe.category;
        if (typeof recipe.category === "object") return recipe.category._id || null;
        return null;
    };

    // Danh sách công thức thuộc danh mục Set menu / Combo để show slide lớn
    const comboRecipes = comboCategory
        ? recipes.filter((r) => getRecipeCategoryId(r) === comboCategory._id)
        : [];

    let filteredRecipes = recipes;
    if (selectedCategoryName !== "ALL") {
        const selectedCategory = categories.find(
            (cat) => cat.name === selectedCategoryName
        );
        if (selectedCategory) {
            filteredRecipes = recipes.filter(
                (r) => getRecipeCategoryId(r) === selectedCategory._id
            );
        }
    }

    const enhancedRecipes = filteredRecipes.map((r) => ({
        ...r,
        onAdd: () => handleAddToBooking(r),
    }));

    const items = cart?.items || [];
    const totalFood = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleUpdateItemQuantity = async (item, newQuantity) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?._id || "test-user-1";

            // Guard: nếu thiếu field bắt buộc thì không gửi request, tránh 400 liên tục
            if (
                !userId ||
                !item ||
                !item.productId ||
                typeof item.name !== "string" ||
                typeof item.price !== "number" ||
                typeof newQuantity !== "number"
            ) {
                console.warn("Cart item thiếu field bắt buộc, bỏ qua update:", {
                    userId,
                    item,
                    newQuantity,
                });
                toast.error(
                    "Một số món trong giỏ đang có dữ liệu cũ, vui lòng xoá và thêm lại món đó."
                );
                return;
            }

            const res = await fetch(`http://localhost:8002/api/cart/${bookingId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: newQuantity,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không cập nhật được số lượng món");
            }

            await fetchCart();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật số lượng");
        }
    };

    const handleRemoveItem = async (item) => {
        // Đặt quantity = 0 để phía cart-service hiểu là xoá món
        return handleUpdateItemQuantity(item, 0);
    };

    const handleConfirmMenu = async () => {
        try {
            if (!items.length) {
                toast.info("Giỏ món đang trống, hãy chọn ít nhất 1 món.");
                return;
            }

            const res = await fetch(
                `http://localhost:8003/api/bookings/${bookingId}/confirm-menu`,
                {
                    method: "POST",
                }
            );

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không thể chốt menu");
            }

            toast.success("Đã chốt menu cho bàn!");
            window.location.href = `/booking/${bookingId}/review`;
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Có lỗi xảy ra khi chốt menu");
        }
    };

    const handleStepClick = (stepId) => {
        // Từ màn chọn menu, cho phép quay lại các bước 1-3 để đặt bàn lại từ đầu
        if (stepId >= 1 && stepId <= 3) {
            navigate("/booking");
        }
    };

    return (
        <div className="container my-5">
            <h2 className="mb-3">Đặt bàn tại nhà hàng</h2>
            <StepHeader currentStep={4} onStepClick={handleStepClick} />
            <h4 className="mb-3">4. Chọn menu</h4>
            <p>Chọn danh mục món (khai vị, món chính, tráng miệng, ...) rồi nhấp vào nút "Thêm món".</p>

            <div className="mb-3 d-flex flex-wrap gap-2">
                <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                        backgroundColor:
                            selectedCategoryName === "ALL" ? "#8b5e3c" : "transparent",
                        color:
                            selectedCategoryName === "ALL" ? "#fff" : "#495057",
                        borderColor:
                            selectedCategoryName === "ALL" ? "#8b5e3c" : "#ced4da",
                    }}
                    onClick={() => setSelectedCategoryName("ALL")}
                >
                    Tất cả món
                </button>

                {categories.map((cat) => {
                    const active = selectedCategoryName === cat.name;
                    return (
                        <button
                            key={cat._id}
                            type="button"
                            className="btn btn-sm"
                            style={{
                                backgroundColor: active ? "#8b5e3c" : "transparent",
                                color: active ? "#fff" : "#495057",
                                borderColor: active ? "#8b5e3c" : "#ced4da",
                            }}
                            onClick={() => setSelectedCategoryName(cat.name)}
                        >
                            {cat.displayName || cat.name}
                        </button>
                    );
                })}
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <RecipeGrid
                        recipeList={enhancedRecipes}
                        disableFavorite
                        large={comboCategory && selectedCategoryName === comboCategory.name}
                    />
                </div>
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <h4>Giỏ món của bàn</h4>
                    {loadingCart && <p>Đang tải giỏ món...</p>}
                    {!loadingCart && items.length === 0 && <p>Chưa có món nào được chọn.</p>}
                    {!loadingCart && items.length > 0 && (
                        <div className="card">
                            <div className="card-body">
                                <ul className="list-group list-group-flush mb-3">
                                    {items.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div>{item.name}</div>
                                                <div
                                                    className="d-flex align-items-center mt-1"
                                                    style={{ gap: 6 }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() =>
                                                            handleUpdateItemQuantity(
                                                                item,
                                                                Math.max(0, item.quantity - 1)
                                                            )
                                                        }
                                                    >
                                                        -
                                                    </button>
                                                    <small className="text-muted">
                                                        x{item.quantity}
                                                    </small>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() =>
                                                            handleUpdateItemQuantity(
                                                                item,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link text-danger ms-1"
                                                        onClick={() => handleRemoveItem(item)}
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                {(item.price * item.quantity).toLocaleString(
                                                    "vi-VN"
                                                )} đ
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="d-flex justify-content-between">
                                    <strong>Tổng tiền món:</strong>
                                    <strong>{totalFood.toLocaleString("vi-VN")} đ</strong>
                                </div>
                                <p className="text-muted mt-2 mb-2" style={{ fontSize: "0.9rem" }}>
                                    (Giá bàn sẽ được cộng thêm ở bước chốt đơn)
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-success w-100 mt-2"
                                    onClick={handleConfirmMenu}
                                >
                                    Chốt menu &amp; tiếp tục
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingMenu;
