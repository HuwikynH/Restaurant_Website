const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    ingredients: [String],
    steps: [String],
    imageThumb: String,
    images: [String],
    videoUrl: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    cookingTime: String,
    serves: Number,
    tags: [String],
    calories: Number,
    price: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    origin: String,
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            content: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5 },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    rating: { type: Number, default: 5 },
    ratingCount: { type: Number, default: 0 },
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Recipe", recipeSchema);