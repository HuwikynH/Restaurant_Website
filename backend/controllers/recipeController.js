const Recipe = require("../models/Recipe");
const User = require("../models/User");
const mongoose = require("mongoose"); // Import mongoose để sử dụng Types.ObjectId
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("category", "name displayName");

    if (!recipe) {
      return res.status(404).json({ msg: "Không tìm thấy công thức" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Lỗi khi lấy công thức theo ID:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getAllRecipesApproved = async (req, res) => {
  try {
    const allRecipes = await Recipe.find({ isApproved: true })
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(allRecipes);
  } catch (error) {
    console.error("Lỗi khi lấy toàn bộ công thức:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getTopLikedRecipes = async (req, res) => {
  try {
    const topRecipes = await Recipe.find({ isApproved: true })
      .populate("createdBy", "username")
      .sort({ likes: -1 })
      .limit(12);
    res.status(200).json(topRecipes);
  } catch (error) {
    console.error("Lỗi khi lấy top công thức:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getTopViewedRecipes = async (req, res) => {
  try {
    const topViewed = await Recipe.find({ isApproved: true })
      .populate("createdBy", "username")
      .sort({ views: -1 })
      .limit(4);
    res.status(200).json(topViewed);
  } catch (error) {
    console.error("Lỗi khi lấy công thức nhiều lượt xem:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getRandomRecipes = async (req, res) => {
  try {
    const randomRecipes = await Recipe.aggregate([
      { $match: { isApproved: true } },
      { $sample: { size: 4 } },
    ]);
    res.status(200).json(randomRecipes);
  } catch (error) {
    console.error("Lỗi khi lấy công thức ngẫu nhiên:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getRandomRecipesForBigSwiper = async (req, res) => {
  try {
    const randomRecipes = await Recipe.aggregate([
      { $match: { isApproved: true } },
      { $sample: { size: 3 } },
    ]);
    res.status(200).json(randomRecipes);
  } catch (error) {
    console.error("Lỗi khi lấy công thức ngẫu nhiên:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getRandomTags = async (req, res) => {
  try {
    const tags = await Recipe.aggregate([
      { $match: { isApproved: true } },
      { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$tags" } },
      { $sample: { size: 20 } },
      { $project: { _id: 0, tag: "$_id" } },
    ]);

    const result = tags.map((t) => t.tag);
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy tag ngẫu nhiên:", error);
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

const getRecipesByTag = async (req, res) => {
  const tag = req.query.query?.toLowerCase() || "";

  try {
    const recipes = await Recipe.find({
      tags: { $regex: tag, $options: "i" },
    }).populate("createdBy", "username");

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Lỗi khi tìm công thức theo tag:", error);
    res.status(500).json({ msg: "Lỗi server khi tìm theo tag", error });
  }
};

const getRecipesByTitleAndIngredient = async (req, res) => {
  const keyword = req.query.query?.toLowerCase() || "";

  try {
    // Tìm theo title
    const byTitle = await Recipe.find({
      title: { $regex: keyword, $options: "i" },
    });

    // Lấy id của kết quả tìm theo title để loại khỏi nguyên liệu
    const titleIds = byTitle.map((r) => r._id.toString());

    // Tìm theo ingredients nhưng loại bỏ các recipe đã có trong title
    const byIngredients = await Recipe.find({
      ingredients: { $elemMatch: { $regex: keyword, $options: "i" } },
      _id: { $nin: titleIds }, // loại công thức đã tìm thấy theo title
    });

    res.status(200).json({
      byTitle,
      byIngredients,
    });
  } catch (error) {
    console.error("Lỗi khi tìm theo title và nguyên liệu:", error);
    res.status(500).json({ msg: "Lỗi server khi tìm kiếm", error });
  }
};

const increaseViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    await Recipe.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({ msg: "Đã tăng lượt xem" });
  } catch (error) {
    res.status(500).json({ msg: "Lỗi khi tăng lượt xem", error });
  }
};

// @desc    Lấy danh sách bình luận của recipe (proxy sang product-service)
// @route   GET /api/recipes/:id/comments
// @access  Public
const getRecipeComments = async (req, res) => {
  try {
    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    const response = await axios.get(
      `${productBase}/api/recipes/${req.params.id}/comments`
    );

    return res.status(200).json(response.data || []);
  } catch (error) {
    console.error("[PROXY getRecipeComments] Lỗi:", error.message);
    return res.status(500).json({ msg: "Lỗi server khi lấy bình luận", error: error.message });
  }
};

// @desc    Thêm bình luận cho recipe (proxy sang product-service)
// @route   POST /api/recipes/:id/comments
// @access  Private
const addRecipeComment = async (req, res) => {
  try {
    const { content, rating } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ msg: "Nội dung bình luận không được để trống" });
    }

    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    const userId = req.user._id || req.user.id;

    // Lấy thông tin user đầy đủ để có tên hiển thị ổn định
    let nameFromUser;
    try {
      const userDoc = await User.findById(userId).lean();
      if (userDoc) {
        nameFromUser =
          userDoc.username ||
          userDoc.name ||
          (userDoc.email ? userDoc.email.split("@")[0] : undefined);
      }
    } catch (lookupErr) {
      console.error("[addRecipeComment] Lỗi khi truy vấn User:", lookupErr.message || lookupErr);
    }

    await axios.post(`${productBase}/api/recipes/${req.params.id}/comments`, {
      content,
      rating,
      userId,
      name: nameFromUser,
    });

    return res.status(201).json({ msg: "Đã thêm bình luận thành công" });
  } catch (error) {
    console.error("[PROXY addRecipeComment] Lỗi:", error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.msg || "Lỗi server khi thêm bình luận";
    return res.status(status).json({ msg, error: error.message });
  }
};

// @desc    Sửa bình luận cho recipe (proxy sang product-service)
// @route   PUT /api/recipes/:recipeId/comments/:commentId
// @access  Private
const updateRecipeComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user._id || req.user.id;

    if (!content) {
      return res
        .status(400)
        .json({ msg: "Nội dung bình luận không được để trống" });
    }

    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    await axios.put(
      `${productBase}/api/recipes/${recipeId}/comments/${commentId}`,
      {
        content,
        rating,
        userId,
      }
    );

    return res.status(200).json({ msg: "Đã sửa bình luận thành công" });
  } catch (error) {
    console.error("[PROXY updateRecipeComment] Lỗi:", error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.msg || "Lỗi server khi sửa bình luận";
    return res.status(status).json({ msg, error: error.message });
  }
};

// @desc    Xóa bình luận cho recipe (proxy sang product-service)
// @route   DELETE /api/recipes/:recipeId/comments/:commentId
// @access  Private
const deleteRecipeComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.isAdmin;

    const productBase = process.env.PRODUCT_SERVICE_URL;
    if (!productBase) {
      return res.status(500).json({ msg: "PRODUCT_SERVICE_URL chưa được cấu hình" });
    }

    await axios.delete(
      `${productBase}/api/recipes/${recipeId}/comments/${commentId}`,
      {
        data: { userId, isAdmin },
      }
    );

    return res.status(200).json({ msg: "Đã xóa bình luận thành công" });
  } catch (error) {
    console.error("[PROXY deleteRecipeComment] Lỗi:", error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.msg || "Lỗi server khi xóa bình luận";
    return res.status(status).json({ msg, error: error.message });
  }
};

// @desc    Top công thức nhiều bình luận nhất
// @route   GET /api/recipes/top-comments
// @access  Public
const getTopCommentedRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recipes = await Recipe.find()
      .populate("createdBy", "username")
      .lean();
    // Thêm trường commentCount
    recipes.forEach(
      (r) => (r.commentCount = r.comments ? r.comments.length : 0)
    );
    // Sắp xếp giảm dần theo commentCount
    recipes.sort((a, b) => b.commentCount - a.commentCount);
    res.status(200).json(recipes.slice(0, limit));
  } catch (error) {
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

// @desc    Bảng tổng quan tất cả công thức, sắp xếp theo điểm trung bình cộng của views, likes, comments
// @route   GET /api/recipes/overview
// @access  Public
const getRecipeOverview = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isApproved: true })
      .populate("createdBy", "username")
      .lean();
    // Tính max cho từng tiêu chí
    let maxViews = 1,
      maxLikes = 1,
      maxComments = 1;
    recipes.forEach((r) => {
      if (r.views > maxViews) maxViews = r.views;
      if (r.likes > maxLikes) maxLikes = r.likes;
      if ((r.comments?.length || 0) > maxComments)
        maxComments = r.comments.length;
    });
    // Tính điểm trung bình cộng (chuẩn hóa về 0-1)
    recipes.forEach((r) => {
      const viewScore = r.views / maxViews;
      const likeScore = r.likes / maxLikes;
      const commentScore = (r.comments?.length || 0) / maxComments;
      r.overviewScore = ((viewScore + likeScore + commentScore) / 3).toFixed(3);
      r.commentCount = r.comments?.length || 0;
    });
    // Sắp xếp giảm dần theo overviewScore
    recipes.sort((a, b) => b.overviewScore - a.overviewScore);
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ msg: "Lỗi server", error });
  }
};

module.exports = {
  getRecipeById,
  getTopLikedRecipes,
  getTopViewedRecipes,
  getRandomRecipes,
  getRandomRecipesForBigSwiper,
  getAllRecipesApproved,
  getRandomTags,
  getRecipesByTag,
  getRecipesByTitleAndIngredient,
  increaseViewCount,
  getRecipeComments,
  addRecipeComment,
  updateRecipeComment,
  deleteRecipeComment,
  getTopCommentedRecipes,
  getRecipeOverview,
};
