const axios = require("axios");

// @desc    Lấy danh sách công thức yêu thích của user (proxy sang product-service)
// @route   GET /api/recipes/favorites
// @access  Private
const getFavoriteRecipes = async (req, res) => {
  try {
    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    const userId = req.user.id;

    // Lấy tất cả công thức đã duyệt từ product-service
    const response = await axios.get(`${productBase}/api/recipes/approved`);
    const allRecipes = Array.isArray(response.data) ? response.data : [];

    // Lọc theo favorites chứa userId
    const favoriteRecipes = allRecipes.filter((r) =>
      (r.favorites || []).some((u) => u.toString() === userId.toString())
    );

    // Phân trang đơn giản trên tập đã lọc
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const total = favoriteRecipes.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    const recipes = favoriteRecipes.slice(start, end);

    res.status(200).json({
      recipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[PROXY getFavoriteRecipes] Lỗi:", error.message);
    res.status(500).json({ msg: "Lỗi server", error: error.message });
  }
};

// @desc    Kiểm tra trạng thái yêu thích của một công thức (proxy sang product-service)
// @route   GET /api/recipes/:id/favorite-status
// @access  Private
const getFavoriteStatus = async (req, res) => {
  try {
    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    const userId = req.user.id;

    const response = await axios.get(
      `${productBase}/api/recipes/${req.params.id}/favorite-status`,
      {
        params: { userId },
      }
    );

    return res.status(200).json({ isFavorite: !!response.data.isFavorite });
  } catch (error) {
    console.error("[PROXY getFavoriteStatus] Lỗi:", error.message);
    res.status(500).json({ msg: "Lỗi server", error: error.message });
  }
};

// @desc    Thêm công thức vào danh sách yêu thích (proxy sang product-service)
// @route   POST /api/recipes/:id/favorite
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    const userId = req.user.id;

    await axios.post(`${productBase}/api/recipes/${req.params.id}/favorite`, {
      userId,
    });

    return res.status(201).json({ msg: "Đã thêm vào danh sách yêu thích" });
  } catch (error) {
    console.error("[PROXY addToFavorites] Lỗi:", error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.msg || "Lỗi server khi thêm yêu thích";
    return res.status(status).json({ msg, error: error.message });
  }
};

// @desc    Xóa công thức khỏi danh sách yêu thích (proxy sang product-service)
// @route   DELETE /api/recipes/:id/favorite
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    const userId = req.user.id;

    await axios.delete(`${productBase}/api/recipes/${req.params.id}/favorite`, {
      data: { userId },
    });

    return res.status(200).json({ msg: "Đã xóa khỏi danh sách yêu thích" });
  } catch (error) {
    console.error("[PROXY removeFromFavorites] Lỗi:", error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.msg || "Lỗi server khi xóa yêu thích";
    return res.status(status).json({ msg, error: error.message });
  }
};

module.exports = {
  getFavoriteRecipes,
  getFavoriteStatus,
  addToFavorites,
  removeFromFavorites,
};
