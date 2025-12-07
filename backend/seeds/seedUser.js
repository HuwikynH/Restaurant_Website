const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../models/User");

dotenv.config({ path: "../.env" });

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Kết nối MongoDB thành công"))
    .catch((err) => {
        console.error("Lỗi kết nối:", err);
        process.exit(1);
    });

// Danh sách user mẫu
const users = [
    {
        username: "loc001",
        email: "loc001@gmail.com",
        password: "loc001",
    },
    {
        username: "loc002",
        email: "loc002@gmail.com",
        password: "loc002",
    },
    {
        username: "loc003",
        email: "loc003@gmail.com",
        password: "loc003",
    },
    {
        username: "loc004",
        email: "loc004@gmail.com",
        password: "loc004",
    },
    {
        username: "loc005",
        email: "loc005@gmail.com",
        password: "loc005",
    },
];

const seedUsers = async () => {
    try {
        // Xoá hết user cũ
        await User.deleteMany({ role: "user" });

        // Hash password và thêm role
        const hashedUsers = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    password: hashedPassword,
                    role: "user",
                };
            })
        );

        await User.insertMany(hashedUsers);
        console.log("Đã seed user thành công!");
        process.exit();
    } catch (err) {
        console.error("Lỗi khi seed:", err);
        process.exit(1);
    }
};

seedUsers();
