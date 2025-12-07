const express = require("express");
const passport = require("passport");
const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Facebook routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect:
      "/auth/social-fail?msg=" +
      encodeURIComponent(
        "Email đã tồn tại. Vui lòng đăng nhập bằng tài khoản đã liên kết."
      ),
  }),
  (req, res) => {
    // Đăng nhập Facebook thành công, redirect về frontend kèm token và user ID
    const token = req.user.generateAuthToken();
    // EncodeURIComponent để đảm bảo các ký tự đặc biệt trong token và id không gây lỗi URL
    res.redirect(
      `${CLIENT_URL}/?token=${encodeURIComponent(
        token
      )}&userId=${encodeURIComponent(
        req.user._id
      )}&provider=${encodeURIComponent(req.user.provider)}`
    );
  }
);

// Google routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      "/auth/social-fail?msg=" +
      encodeURIComponent(
        "Email đã tồn tại. Vui lòng đăng nhập bằng tài khoản đã liên kết."
      ),
  }),
  (req, res) => {
    // Đăng nhập Google thành công, redirect về frontend kèm token và user ID
    const token = req.user.generateAuthToken();
    // EncodeURIComponent để đảm bảo các ký tự đặc biệt trong token và id không gây lỗi URL
    res.redirect(
      `${CLIENT_URL}/?token=${encodeURIComponent(
        token
      )}&userId=${encodeURIComponent(
        req.user._id
      )}&provider=${encodeURIComponent(req.user.provider)}`
    );
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Route xử lý khi social login thất bại
router.get("/social-fail", (req, res) => {
  // Redirect về trang frontend kèm thông báo lỗi
  const msg = req.query.msg || "Đăng nhập thất bại";
  res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
});

module.exports = router;
