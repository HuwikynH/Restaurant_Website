const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const configurePassport = require("./config/passport"); // Import hàm cấu hình
const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Load env vars
dotenv.config();

// Configure Passport
configurePassport(passport);

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Simple request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[backend] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});

// Enable CORS
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const favoriteRoutes = require("./routes/favoriteRoutes");
const recipeRoutes = require("./routes/recipesRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const cloudinaryRoutes = require("./routes/cloudinaryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const blogReviewRoutes = require("./routes/blogReviewRoutes");

app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blogreviews", blogReviewRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "backend",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || "Server Error",
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("API endpoints:");
    console.log("  /api/recipes/overview");
    console.log("  /api/recipes/top-comments");
});
