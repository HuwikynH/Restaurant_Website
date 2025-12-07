const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const recipeRoutes = require("./routes/recipesRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers (align with frontend: /api/recipes and /api/categories)
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);

// Simple health check route
app.get("/api/products/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});

const PORT = process.env.PRODUCT_SERVICE_PORT || 5001;

const server = app.listen(
    PORT,
    console.log(
        `Product service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});