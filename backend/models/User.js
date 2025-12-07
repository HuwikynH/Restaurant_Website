const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // Import jwt
const Recipe = require("./Recipe"); // Import Recipe model

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Không bắt buộc vì social login không cần password
    role: { type: String, default: "user" }, // Mặc định là user, admin sẽ gán riêng
    facebookId: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String }, // 'local', 'facebook', 'google'
    name: { type: String },
    isVerified: { type: Boolean, default: false }, // Thêm trường xác thực email
    verificationToken: { type: String, unique: true, sparse: true }, // Thêm trường token xác thực
  },
  { timestamps: true }
);

// Method để tạo JWT token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "1234",
    { expiresIn: "2h" }
  );
  return token;
};

module.exports = mongoose.model("User", userSchema);
