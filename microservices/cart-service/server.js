const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Simple request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[cart-service] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "cart-service",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.CART_SERVICE_PORT || 8002;
app.listen(PORT, () => {
    console.log(`Cart Service running on port ${PORT}`);
});
