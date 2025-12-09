const Recipe = require("../models/Recipe");

// @desc    Get a single recipe by its ID
// @route   GET /api/recipes/:id
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate(
            "category",
            "name displayName"
        );

        if (!recipe) {
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        }

        res.status(200).json(recipe);
    } catch (error) {
        console.error("Lỗi khi lấy công thức theo ID:", error);
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Get all recipes with pagination and search
// @route   GET /api/recipes
const getAllRecipes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const keyword = req.query.keyword || "";

        let query = {};
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { tags: { $regex: keyword, $options: "i" } },
            ];
        }

        const total = await Recipe.countDocuments(query);
        const recipes = await Recipe.find(query)
            .populate("category", "displayName name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            recipes,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error("Lỗi khi lấy toàn bộ công thức:", error);
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Get all approved recipes (with populated category for frontend filters)
// @route   GET /api/recipes/approved
const getAllRecipesApproved = async (req, res) => {
    try {
        const allRecipes = await Recipe.find({ isApproved: true })
            .populate("category", "displayName name")
            .sort({ createdAt: -1 });
        res.status(200).json(allRecipes);
    } catch (error) {
        console.error("Lỗi khi lấy toàn bộ công thức:", error);
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Get top viewed recipes
// @route   GET /api/recipes/top-viewed
const getTopViewedRecipes = async (req, res) => {
    try {
        const topViewed = await Recipe.find({ isApproved: true })
            .sort({ views: -1 })
            .limit(4);
        res.status(200).json(topViewed);
    } catch (error) {
        console.error("Lỗi khi lấy công thức nhiều lượt xem:", error);
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Get random recipes
// @route   GET /api/recipes/random
const getRandomRecipes = async (req, res) => {
    try {
        const size = parseInt(req.query.size) || 4;
        const randomRecipes = await Recipe.aggregate([
            { $match: { isApproved: true } },
            { $sample: { size: size } },
        ]);
        res.status(200).json(randomRecipes);
    } catch (error) {
        console.error("Lỗi khi lấy công thức ngẫu nhiên:", error);
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
const createRecipe = async (req, res) => {
    try {
        const {
            title,
            description,
            ingredients,
            steps,
            imageThumb,
            images,
            cookingTime,
            serves,
            tags,
            calories,
            origin,
            videoUrl,
            category,
            isApproved,
            price,
        } = req.body;

        if (!title || !category) {
            return res.status(400).json({ msg: "Thiếu tiêu đề hoặc danh mục." });
        }

        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            steps,
            imageThumb,
            images,
            cookingTime,
            serves,
            tags,
            calories,
            origin,
            videoUrl,
            category, // Assuming category is a valid ObjectId string
            isApproved: isApproved ?? false,
            price: typeof price === "number" ? price : 0,
        });

        const savedRecipe = await newRecipe.save();
        const populatedRecipe = await Recipe.findById(savedRecipe._id).populate(
            "category",
            "displayName name"
        );
        res.status(201).json(populatedRecipe);
    } catch (error) {
        console.error("Lỗi khi tạo công thức:", error);
        res.status(500).json({ msg: "Lỗi server khi tạo công thức", error });
    }
};

// @desc    Update a recipe (or create if not exists, to keep IDs in sync with monolith)
// @route   PUT /api/recipes/:id
const updateRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;

        // Các field cho phép cập nhật/khởi tạo
        const fields = [
            "title",
            "description",
            "ingredients",
            "steps",
            "imageThumb",
            "images",
            "videoUrl",
            "cookingTime",
            "serves",
            "tags",
            "calories",
            "origin",
            "category",
            "isApproved",
            "price",
        ];

        const updateData = {};
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        updateData.updatedAt = Date.now();

        // Tìm recipe theo ID; nếu không có thì tạo mới với _id khớp monolith
        let recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            recipe = new Recipe({
                _id: recipeId,
                ...updateData,
            });
            await recipe.save();
        } else {
            Object.assign(recipe, updateData);
            await recipe.save();
        }

        const populatedRecipe = await Recipe.findById(recipe._id).populate(
            "category",
            "displayName name"
        );

        res.status(200).json(populatedRecipe);
    } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res) => {
    try {
        const deleted = await Recipe.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ msg: "Không tìm thấy công thức." });

        res.status(200).json({ msg: "Đã xoá công thức thành công." });
    } catch (err) {
        console.error("Lỗi xoá công thức:", err);
        return res.status(500).json({ msg: "Lỗi server", error: err });
    }
};

// @desc    Get a list of random tags
// @route   GET /api/recipes/tags/random
const getRandomTags = async (req, res) => {
    try {
        const tags = await Recipe.aggregate([
            { $match: { isApproved: true } },
            { $unwind: "$tags" },
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

// @desc    Get recipes by a specific tag
// @route   GET /api/recipes/tags/search
const getRecipesByTag = async (req, res) => {
    const tag = req.query.query?.toLowerCase() || "";

    try {
        const recipes = await Recipe.find({
            tags: { $regex: tag, $options: "i" },
        });

        res.status(200).json(recipes);
    } catch (error) {
        console.error("Lỗi khi tìm công thức theo tag:", error);
        res.status(500).json({ msg: "Lỗi server khi tìm theo tag", error });
    }
};


// @desc    Search recipes by title and ingredients
// @route   GET /api/recipes/search
const getRecipesByTitleAndIngredient = async (req, res) => {
    const keyword = req.query.query?.toLowerCase() || "";

    try {
        const byTitle = await Recipe.find({
            title: { $regex: keyword, $options: "i" },
        });

        const titleIds = byTitle.map((r) => r._id.toString());

        const byIngredients = await Recipe.find({
            ingredients: { $elemMatch: { $regex: keyword, $options: "i" } },
            _id: { $nin: titleIds },
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

// @desc    Increase the view count of a recipe
// @route   POST /api/recipes/:id/view
const increaseViewCount = async (req, res) => {
    try {
        await Recipe.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.status(200).json({ msg: "Đã tăng lượt xem" });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi khi tăng lượt xem", error });
    }
};


// --- Comments & Rating ---

// @desc    Lấy danh sách bình luận của recipe
// @route   GET /api/recipes/:id/comments
const getRecipeComments = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe)
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        res.status(200).json(recipe.comments || []);
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Thêm bình luận cho recipe (kèm tuỳ chọn đánh giá sao)
// @route   POST /api/recipes/:id/comments
const addRecipeComment = async (req, res) => {
    try {
        const { content, rating, name } = req.body;

        if (!content)
            return res
                .status(400)
                .json({ msg: "Nội dung bình luận không được để trống" });

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe)
            return res.status(404).json({ msg: "Không tìm thấy công thức" });

        const userId =
            req.user?._id ||
            req.user?.id ||
            req.body.userId ||
            req.query.userId;

        const comment = { user: userId, content };
        if (name) {
            comment.name = name;
        }

        if (typeof rating === "number" && rating >= 1 && rating <= 5) {
            comment.rating = rating;
        }

        recipe.comments.push(comment);

        // Cập nhật lại điểm trung bình rating và số lượt đánh giá
        const ratedComments = recipe.comments.filter(
            (c) => typeof c.rating === "number" && c.rating >= 1 && c.rating <= 5
        );

        if (ratedComments.length > 0) {
            const total = ratedComments.reduce((sum, c) => sum + c.rating, 0);
            recipe.rating = Math.round((total / ratedComments.length) * 10) / 10;
            recipe.ratingCount = ratedComments.length;
        } else {
            recipe.rating = 5;
            recipe.ratingCount = 0;
        }

        await recipe.save();
        res.status(201).json({ msg: "Đã thêm bình luận thành công" });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Sửa bình luận cho recipe (có thể cập nhật cả rating)
// @route   PUT /api/recipes/:recipeId/comments/:commentId
const updateRecipeComment = async (req, res) => {
    try {
        const { recipeId, commentId } = req.params;
        const { content, rating } = req.body;
        const userId =
            req.user?._id ||
            req.user?.id ||
            req.body.userId ||
            req.query.userId;

        if (!content)
            return res
                .status(400)
                .json({ msg: "Nội dung bình luận không được để trống" });

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        }

        const comment = recipe.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ msg: "Không tìm thấy bình luận" });
        }

        if (userId && comment.user.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ msg: "Bạn không có quyền sửa bình luận này" });
        }

        comment.content = content;
        if (typeof rating === "number" && rating >= 1 && rating <= 5) {
            comment.rating = rating;
        }

        const ratedComments = recipe.comments.filter(
            (c) => typeof c.rating === "number" && c.rating >= 1 && c.rating <= 5
        );

        if (ratedComments.length > 0) {
            const total = ratedComments.reduce((sum, c) => sum + c.rating, 0);
            recipe.rating = Math.round((total / ratedComments.length) * 10) / 10;
            recipe.ratingCount = ratedComments.length;
        } else {
            recipe.rating = 5;
            recipe.ratingCount = 0;
        }

        await recipe.save();
        res.status(200).json({ msg: "Đã sửa bình luận thành công" });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Xóa bình luận cho recipe
// @route   DELETE /api/recipes/:recipeId/comments/:commentId
const deleteRecipeComment = async (req, res) => {
    try {
        const { recipeId, commentId } = req.params;
        const userId =
            req.user?._id ||
            req.user?.id ||
            req.body.userId ||
            req.query.userId;
        const isAdmin =
            (req.user && req.user.isAdmin) ||
            req.body.isAdmin === true ||
            req.query.isAdmin === "true";

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        }

        const comment = recipe.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ msg: "Không tìm thấy bình luận" });
        }

        if (!isAdmin && userId && comment.user.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ msg: "Bạn không có quyền xóa bình luận này" });
        }

        recipe.comments = recipe.comments.filter(
            (c) => c._id.toString() !== commentId.toString()
        );

        const ratedComments = recipe.comments.filter(
            (c) => typeof c.rating === "number" && c.rating >= 1 && c.rating <= 5
        );

        if (ratedComments.length > 0) {
            const total = ratedComments.reduce((sum, c) => sum + c.rating, 0);
            recipe.rating = Math.round((total / ratedComments.length) * 10) / 10;
            recipe.ratingCount = ratedComments.length;
        } else {
            recipe.rating = 5;
            recipe.ratingCount = 0;
        }

        await recipe.save();
        res.status(200).json({ msg: "Đã xóa bình luận thành công" });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// --- Favorites ---

// @desc    Kiểm tra trạng thái yêu thích của user với recipe
// @route   GET /api/recipes/:id/favorite-status
const getFavoriteStatus = async (req, res) => {
    try {
        const userId =
            (req.user && (req.user._id || req.user.id)) ||
            req.query.userId ||
            req.body?.userId;
        if (!userId) {
            return res.status(200).json({ isFavorite: false });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        }

        const isFavorite = (recipe.favorites || []).some(
            (u) => u.toString() === userId.toString()
        );
        res.status(200).json({ isFavorite });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Thêm recipe vào danh sách yêu thích của user
// @route   POST /api/recipes/:id/favorite
const addFavorite = async (req, res) => {
    try {
        const userId =
            (req.user && (req.user._id || req.user.id)) ||
            req.body?.userId ||
            req.query.userId;
        if (!userId) {
            return res.status(401).json({ msg: "Bạn cần đăng nhập" });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        }

        recipe.favorites = recipe.favorites || [];
        const exists = recipe.favorites.some(
            (u) => u.toString() === userId.toString()
        );
        if (!exists) {
            recipe.favorites.push(userId);
        }

        await recipe.save();
        res.status(200).json({ msg: "Đã thêm vào yêu thích" });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};

// @desc    Xóa recipe khỏi danh sách yêu thích của user
// @route   DELETE /api/recipes/:id/favorite
const removeFavorite = async (req, res) => {
    try {
        const userId =
            (req.user && (req.user._id || req.user.id)) ||
            req.body?.userId ||
            req.query.userId;
        if (!userId) {
            return res.status(401).json({ msg: "Bạn cần đăng nhập" });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: "Không tìm thấy công thức" });
        }

        recipe.favorites = (recipe.favorites || []).filter(
            (u) => u.toString() !== userId.toString()
        );
        await recipe.save();
        res.status(200).json({ msg: "Đã xoá khỏi yêu thích" });
    } catch (error) {
        res.status(500).json({ msg: "Lỗi server", error });
    }
};


module.exports = {
    getRecipeById,
    getTopViewedRecipes,
    getRandomRecipes,
    getAllRecipes,
    getAllRecipesApproved,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRandomTags,
    getRecipesByTag,
    getRecipesByTitleAndIngredient,
    increaseViewCount,
    getRecipeComments,
    addRecipeComment,
    updateRecipeComment,
    deleteRecipeComment,
    getFavoriteStatus,
    addFavorite,
    removeFavorite,
};