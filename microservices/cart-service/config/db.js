const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_website"
        );
        console.log(`Cart-Service MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Cart-Service MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
