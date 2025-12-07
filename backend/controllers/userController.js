const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendNewPasswordEmail,
} = require("../services/emailService");

// Sign in
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailNormalized = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) return res.status(400).json({ msg: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email: emailNormalized,
      password: hashedPassword,
      role: "user",
      verificationToken: crypto.randomBytes(32).toString("hex"),
    });
    await newUser.save();

    try {
      await sendVerificationEmail(newUser.email, newUser.verificationToken);
    } catch (emailError) {
      // If email sending fails, delete the created user
      await User.findByIdAndDelete(newUser._id);
      // Re-throw the error to be caught by the outer catch block
      throw emailError;
    }

    res.status(201).json({
      msg: "Đăng ký thành công. Vui lòng kiểm tra email của bạn để xác thực tài khoản.",
    });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server", error: err });
  }
};

// Log in
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Vui lòng nhập đầy đủ email và mật khẩu" });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
      console.log("Không tìm thấy user với email:", emailNormalized);
      return res.status(400).json({ msg: "Sai email hoặc mật khẩu" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Mật khẩu không khớp cho user:", emailNormalized);
      return res.status(400).json({ msg: "Sai email hoặc mật khẩu" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "1234",
      { expiresIn: "2h" }
    );

    res.status(200).json({
      msg: "Đăng nhập thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
        isVerified: user.isVerified,
        isAdmin: user.role === "admin",
      },
      token,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { username, oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!username || !username.trim()) {
      return res
        .status(400)
        .json({ msg: "Tên người dùng không được để trống" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("Không tìm thấy user với id:", req.user.id);
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    // Nếu có thay đổi mật khẩu
    if (newPassword || confirmPassword) {
      if (!oldPassword) {
        return res.status(400).json({ msg: "Vui lòng nhập mật khẩu cũ" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        console.log("Mật khẩu cũ không đúng cho user:", user.email);
        return res.status(400).json({ msg: "Mật khẩu cũ không đúng" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ msg: "Mật khẩu mới không khớp" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ msg: "Mật khẩu mới phải từ 6 ký tự" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Cập nhật username hoặc name tùy thuộc vào provider
    if (user.provider === "local" || !user.provider) {
      // Cập nhật username cho tài khoản local
      if (username.trim() !== user.username) {
        user.username = username.trim();
      }
    } else {
      // Cập nhật name cho tài khoản social
      if (username.trim() !== user.name) {
        user.name = username.trim();
      }
    }

    await user.save();
    console.log("Cập nhật profile thành công cho user:", user.email);
    res.json({ msg: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi khi cập nhật profile:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách người dùng (Admin)
const getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Không có quyền truy cập" });
    }

    const { email } = req.query;
    let query = {};

    if (email) {
      // Tìm kiếm không phân biệt hoa thường và chứa chuỗi email
      query.email = { $regex: email, $options: "i" };
    }

    const users = await User.find(query, "-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Lấy thông tin chi tiết người dùng (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Cập nhật thông tin người dùng (Admin)
const updateUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Không có quyền truy cập" });
    }

    const { username, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    if (username) user.username = username.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (role) user.role = role;

    await user.save();
    res.status(200).json({ msg: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Xóa người dùng (Admin)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Không có quyền truy cập" });
    }

    const userId = req.params.id;

    // Sử dụng findByIdAndDelete để tìm và xóa người dùng
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ msg: "Xóa người dùng thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa người dùng:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Tạo tài khoản mới (Admin)
const createUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Không có quyền truy cập" });
    }

    const { username, email, password, role } = req.body;
    const emailNormalized = email.trim().toLowerCase();

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(400).json({ msg: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      username,
      email: emailNormalized,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();
    res.status(201).json({
      msg: "Tạo tài khoản thành công",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Lỗi khi tạo tài khoản:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Lấy thông tin chi tiết người dùng bao gồm mật khẩu (Admin)
const getUserDetailsWithPassword = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Không có quyền truy cập" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Đặt lại mật khẩu người dùng về mặc định (Admin)
const resetUserPasswordByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Không có quyền truy cập" });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    const defaultPassword = "remy"; // Mật khẩu mặc định
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: 'Đặt lại mật khẩu thành công về "remy"' });
  } catch (err) {
    console.error("Lỗi khi đặt lại mật khẩu:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Token xác thực không hợp lệ hoặc đã hết hạn." });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Xóa token sau khi xác thực
    await user.save();

    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/verify-email-status?status=success&msg=${encodeURIComponent(
        "Email của bạn đã được xác thực thành công."
      )}`
    );
  } catch (err) {
    console.error("Lỗi xác thực email:", err);
    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/verify-email-status?status=error&msg=${encodeURIComponent(
        "Token xác thực không hợp lệ hoặc đã hết hạn."
      )}`
    );
  }
};

// Quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Vui lòng nhập email" });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Email không tồn tại" });
    // Tạo mật khẩu mới random
    const newPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    // Gửi email cho user
    await sendNewPasswordEmail(user.email, newPassword);
    res.json({ msg: "Mật khẩu mới đã được gửi tới email của bạn." });
  } catch (err) {
    console.error("Lỗi quên mật khẩu:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

module.exports = {
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
};
