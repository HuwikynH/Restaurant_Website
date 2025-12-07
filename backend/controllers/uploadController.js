const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "recipe_uploads", // Optional folder name in Cloudinary
        format: async (req, file) => "jpg", // supports promises as well
        public_id: (req, file) =>
            Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
    },
});

// Multer upload middleware
const upload = multer({ storage: storage });

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Public (or Private if needed)
const uploadFile = (req, res) => {
    // Multer middleware handles the upload
    // If successful, the file information will be in req.file
    if (req.file) {
        res.status(200).json({
            url: req.file.path, // URL of the uploaded file
            public_id: req.file.filename, // Public ID in Cloudinary
        });
    } else {
        res.status(400).json({ msg: "Không có file nào được tải lên." });
    }
};

module.exports = { upload, uploadFile };
