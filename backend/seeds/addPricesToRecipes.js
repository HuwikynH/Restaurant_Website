const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Recipe = require("../models/Recipe");

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const recipes = await Recipe.find();
        console.log(`Found ${recipes.length} recipes`);

        const minPrice = 50000; // 50k
        const maxPrice = 300000; // 300k

        const updates = recipes.map((recipe) => {
            if (recipe.price && recipe.price > 0) return null;
            const randomPrice =
                Math.floor(Math.random() * ((maxPrice - minPrice) / 10000 + 1)) * 10000 + minPrice; // bội số 10k
            recipe.price = randomPrice;
            return recipe.save();
        }).filter(Boolean);

        await Promise.all(updates);
        console.log(`Updated ${updates.length} recipes with random prices`);
    } catch (err) {
        console.error("Error while adding prices to recipes:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    }
}

run();
