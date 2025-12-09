const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
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
            `[order-service] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});

const bookingRoutes = require("./routes/bookingRoutes");
const tableRoutes = require("./routes/tableRoutes");
const Table = require("./models/Table");
const Booking = require("./models/Booking");

app.use("/api/bookings", bookingRoutes);
app.use("/api/tables", tableRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "order-service",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Server error" });
});

const seedTablesIfEmpty = async () => {
    try {
        const count = await Table.countDocuments();
        // Nếu đã có khá nhiều bàn rồi thì coi như đã seed
        if (count >= 50) return;

        const baseTables = [];
        const branchesSeed = [
            {
                id: "branch-q1",
                name: "Nhà hàng Ratatouille - Quận 1",
            },
            {
                id: "branch-q7",
                name: "Nhà hàng Ratatouille - Quận 7",
            },
        ];

        branchesSeed.forEach((branch) => {
            // Tầng 1: B01 - B36
            for (let i = 1; i <= 36; i++) {
                const code = `B${String(i).padStart(2, "0")}`;
                baseTables.push({
                    code,
                    branchId: branch.id,
                    branchName: branch.name,
                    floorId: 1,
                    floorName: "Tầng 1",
                    capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
                    minPrice: i % 3 === 0 ? 800000 : i % 2 === 0 ? 500000 : 300000,
                    type: i % 12 === 0 ? "vip" : "normal",
                    status: "active",
                    note:
                        i % 12 === 0
                            ? "Bàn VIP, vị trí đẹp"
                            : i % 6 === 0
                            ? "Gần lối đi"
                            : i % 5 === 0
                            ? "Gần cửa sổ"
                            : "",
                });
            }

            // Tầng 2: C01 - C18
            for (let i = 1; i <= 18; i++) {
                const code = `C${String(i).padStart(2, "0")}`;
                baseTables.push({
                    code,
                    branchId: branch.id,
                    branchName: branch.name,
                    floorId: 2,
                    floorName: "Tầng 2",
                    capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
                    minPrice: i % 3 === 0 ? 800000 : i % 2 === 0 ? 500000 : 300000,
                    type: i % 9 === 0 ? "vip" : "normal",
                    status: "active",
                    note:
                        i % 9 === 0
                            ? "Phòng riêng nhỏ"
                            : i % 4 === 0
                            ? "Gần ban công"
                            : "Khu yên tĩnh",
                });
            }
        });

        try {
            await Table.insertMany(baseTables, { ordered: false });
            console.log(`Seeded ${baseTables.length} tables into DB`);
        } catch (insertErr) {
            // Bỏ qua lỗi trùng key do đã tồn tại một số bàn
            console.warn("Seed tables completed with some duplicates (ignored)." );
        }
    } catch (e) {
        console.error("seedTablesIfEmpty error:", e);
    }
};

const startExpirePendingBookingsJob = () => {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:8004";

    setInterval(async () => {
        try {
            const now = new Date();
            const pending = await Booking.find({
                status: "PENDING_PAYMENT",
                paymentStatus: "PENDING",
                paymentExpiresAt: { $lte: now },
            });

            if (!pending.length) return;

            for (const booking of pending) {
                const amount = booking.totalPrice || 0;
                try {
                    await axios.post(`${paymentServiceUrl}/api/payments/expired`, {
                        bookingId: booking._id.toString(),
                        amount,
                        method: "MOCK",
                    });
                } catch (err) {
                    console.error(
                        "Failed to create expired payment for booking",
                        booking._id.toString(),
                        err.message
                    );
                }

                booking.status = "CANCELLED";
                booking.paymentStatus = "EXPIRED";
                await booking.save();
            }
        } catch (err) {
            console.error("expirePendingBookings job error:", err);
        }
    }, 60 * 1000);
};

const PORT = process.env.ORDER_SERVICE_PORT || 8003;
app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
    seedTablesIfEmpty();
    startExpirePendingBookingsJob();
});
