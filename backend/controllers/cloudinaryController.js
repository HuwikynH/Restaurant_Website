const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// XÓA tất cả ảnh trong thư mục recipes/:id
const deleteImagesInRecipeFolder = async (req, res) => {
    const recipeId = req.params.id;
    const folderPath = `recipes/${recipeId}`;

    try {
        const result = await cloudinary.api.resources({
            type: "upload",
            prefix: folderPath + "/", // chỉ ảnh trong folder, KHÔNG folder con
            max_results: 100,
        });

        const publicIds = result.resources.map((file) => file.public_id);

        if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
        }

        return res.status(200).json({
            msg: "Đã xóa toàn bộ ảnh trong thư mục",
            deleted: publicIds,
        });
    } catch (error) {
        console.error("Lỗi khi xóa ảnh trong thư mục:", error);
        return res.status(500).json({
            msg: "Lỗi khi xóa ảnh trong folder công thức",
            error,
        });
    }
};

const deleteSelectedImages = async (req, res) => {
    const { publicUrls } = req.body;

    if (!publicUrls || publicUrls.length === 0) {
        return res.status(400).json({ msg: "Không có ảnh cần xoá." });
    }

    try {
        // Chuyển URL ảnh về public_id để xóa
        const publicIds = publicUrls.map((url) => {
            const parts = url.split("/");
            const folderIndex = parts.findIndex((p) => p === "recipes");
            return parts
                .slice(folderIndex)
                .join("/")
                .replace(/\.[^/.]+$/, ""); // bỏ phần mở rộng
        });

        await cloudinary.api.delete_resources(publicIds);

        return res.status(200).json({ msg: "Đã xoá ảnh", deleted: publicIds });
    } catch (err) {
        console.error("Lỗi khi xoá ảnh:", err);
        res.status(500).json({ msg: "Xoá ảnh thất bại", error: err });
    }
};

// Middleware: tạo storage động theo folder recipeId
const createCustomUploader = (folderName) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `recipes/${folderName}`,
            format: async () => "jpg", // hoặc để nguyên nếu không cần ép
            public_id: (req, file) =>
                Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
        },
    });
    return multer({ storage });
};

// Hàm upload 1 ảnh
const uploadRecipeImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: "Không có file được upload." });
    }

    res.status(200).json({
        url: req.file.path,
        public_id: req.file.filename,
    });
};

const createUploaderWithRecipeId = () => {
    return (req, res, next) => {
        const recipeId = req.query.recipeId;
        if (!recipeId) {
            return res.status(400).json({ msg: "Thiếu recipeId trong query" });
        }

        const storage = new CloudinaryStorage({
            cloudinary,
            params: {
                folder: `recipes/${recipeId}`,
                format: async () => "jpg", // có thể đổi sang `file.mimetype.split("/")[1]` nếu cần giữ định dạng
                public_id: (req, file) =>
                    Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
            },
        });

        const upload = multer({ storage }).single("image");

        upload(req, res, function (err) {
            if (err) {
                console.error("Lỗi upload:", err);
                return res.status(500).json({ msg: "Lỗi upload ảnh", error: err });
            }
            next();
        });
    };
};

//  uploader cho danh mục
const createCustomUploaderCategory = (categoryId) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `categories/${categoryId}`,
            format: async () => "jpg",
            public_id: (req, file) =>
                Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
        },
    });

    return multer({ storage });
};

// Upload ảnh danh mục
const uploadCategoryImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: "Không có file ảnh" });
    }

    res.status(200).json({
        url: req.file.path,
        public_id: req.file.filename,
    });
};

const createUploaderWithCategoryId = () => {
    return (req, res, next) => {
        const categoryId = req.query.categoryId;
        if (!categoryId) {
            return res.status(400).json({ msg: "Thiếu categoryId trong query" });
        }

        const storage = new CloudinaryStorage({
            cloudinary,
            params: {
                folder: `categories/${categoryId}`,
                format: async () => "jpg",
                public_id: (req, file) =>
                    Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
            },
        });

        const upload = multer({ storage }).single("image");

        upload(req, res, function (err) {
            if (err) {
                return res.status(500).json({ msg: "Lỗi upload ảnh", error: err });
            }
            next();
        });
    };
};

const deleteImagesInCategoryFolder = async (req, res) => {
    const categoryId = req.params.id;
    const folderPath = `categories/${categoryId}`;

    try {
        const result = await cloudinary.api.resources({
            type: "upload",
            prefix: folderPath + "/", // chỉ ảnh trong folder này
            max_results: 100,
        });

        const publicIds = result.resources.map((file) => file.public_id);

        if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
        }

        return res.status(200).json({
            msg: "Đã xóa toàn bộ ảnh trong thư mục danh mục",
            deleted: publicIds,
        });
    } catch (error) {
        console.error("Lỗi khi xóa ảnh trong thư mục danh mục:", error);
        return res.status(500).json({
            msg: "Lỗi khi xóa ảnh trong thư mục",
            error,
        });
    }
};

module.exports = {
    deleteImagesInRecipeFolder,
    deleteSelectedImages,
    uploadRecipeImage,
    createCustomUploader,
    createUploaderWithRecipeId,
    uploadCategoryImage,
    createCustomUploaderCategory,
    createUploaderWithCategoryId,
    deleteImagesInCategoryFolder,
};
