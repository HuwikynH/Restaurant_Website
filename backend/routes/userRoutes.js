const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  createUserByAdmin,
  getUserDetailsWithPassword,
  resetUserPasswordByAdmin,
  verifyEmail,
  forgotPassword,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

// Routes cho người dùng thông thường
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.put("/update-profile", auth, updateProfile);

// Routes cho admin
router.get("/admin/users", auth, getAllUsers);
router.get("/admin/users/:id", auth, getUserById);
router.get("/admin/users/:id/details", auth, getUserDetailsWithPassword);
router.post("/admin/users", auth, createUserByAdmin);
router.put("/admin/users/:id", auth, updateUserByAdmin);
router.delete("/admin/users/:id", auth, deleteUser);
router.post("/admin/users/:id/reset-password", auth, resetUserPasswordByAdmin);

// Protected routes
router.get("/:id", auth, getUserById);
router.post("/forgot-password", forgotPassword);

module.exports = router;
