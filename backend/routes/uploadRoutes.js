const express = require("express");
const router = express.Router();
const { upload, uploadFile } = require("../controllers/uploadController");

// @desc    Upload single image
// @route   POST /api/upload
// @access  Public (or Private)
router.post("/", upload.single("image"), uploadFile);

module.exports = router;
