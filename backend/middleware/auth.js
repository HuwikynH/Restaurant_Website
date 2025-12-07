const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ msg: "Không tìm thấy token xác thực" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "1234");
    req.user = decoded;
    req.user.isAdmin = decoded.role === "admin";
    next();
  } catch (err) {
    console.error("Lỗi xác thực:", err);
    res.status(401).json({ msg: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = auth;
