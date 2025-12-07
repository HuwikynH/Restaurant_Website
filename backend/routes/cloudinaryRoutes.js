const express = require("express");
const router = express.Router();
const {
    deleteImagesInRecipeFolder,
    deleteSelectedImages,
    uploadRecipeImage,
    createCustomUploader,
    createUploaderWithRecipeId,
    uploadCategoryImage,
    createCustomUploaderCategory,
    createUploaderWithCategoryId,
    deleteImagesInCategoryFolder,
} = require("../controllers/cloudinaryController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Xóa ảnh trong folder
router.delete("/recipes/:id/images", deleteImagesInRecipeFolder);

router.post("/recipes/:id/delete-images", deleteSelectedImages);

// Upload ảnh mới (1 ảnh tại 1 thời điểm)
router.post(
    "/recipes/upload-image",
    (req, res, next) => {
        const folderName = req.query.recipeId; // Lấy từ query thay vì body
        if (!folderName) {
            return res.status(400).json({ msg: "Thiếu recipeId trong query" });
        }

        const upload = createCustomUploader(folderName).single("image");
        upload(req, res, function (err) {
            if (err) {
                return res.status(500).json({ msg: "Lỗi khi upload ảnh", error: err });
            }
            next();
        });
    },
    uploadRecipeImage
);

router.delete("/categories/:id/images", deleteImagesInCategoryFolder);

//  upload ảnh danh mục theo ID
router.post("/categories/upload-image", createUploaderWithCategoryId(), uploadCategoryImage);

// Tạo storage cho blogs
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogs',
    format: async () => 'jpg',
    public_id: (req, file) =>
      Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
  },
});
const uploadBlog = multer({ storage: blogStorage });

// Route upload ảnh blog
router.post('/blogs/upload-image', uploadBlog.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'Không có file được upload.' });
  }
  res.status(200).json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

module.exports = router;
