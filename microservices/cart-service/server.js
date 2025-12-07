const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.CART_SERVICE_PORT || 8002;
app.listen(PORT, () => {
    console.log(`Cart Service running on port ${PORT}`);
});
