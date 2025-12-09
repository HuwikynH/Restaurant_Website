const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { startBookingCreatedConsumer } = require("./rabbitmq");

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
            `[payment-service] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "payment-service",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.PAYMENT_SERVICE_PORT || 8004;
app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
    // Khởi động consumer để lắng nghe sự kiện booking.created từ RabbitMQ (nếu được cấu hình)
    startBookingCreatedConsumer();
});
