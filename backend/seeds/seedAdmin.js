const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../models/User");

dotenv.config({ path: "../.env" });

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Kết nối MongoDB thành công"))
    .catch((err) => console.error("Lỗi kết nối:", err));

// Thêm admin
const createAdmin = async () => {
    try {
        const existing = await User.findOne({ email: "admin@gmail.com" });
        if (existing) {
            console.log("Admin đã tồn tại.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("remy", 10);

        const adminUser = new User({
            username: "admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin", // <-- Thêm role
        });

        await adminUser.save();
        console.log("Tạo tài khoản admin thành công!");
        process.exit();
    } catch (err) {
        console.error("Lỗi:", err);
        process.exit(1);
    }
};

createAdmin();
