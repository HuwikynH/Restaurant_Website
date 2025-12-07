const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/recipe_website"
        );
        console.log(`MongoDB Connected: ${conn.connection.host}`); // Log connection host on success
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`); // More detailed error message
        process.exit(1); // dừng server nếu connect fail
    }
};

module.exports = connectDB;