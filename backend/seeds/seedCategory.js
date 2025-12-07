const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../models/Category");

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const categories = [
    {
        name: "main",
        displayName: "Bữa chính",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748331750/7952_tjsnkb.webp",
    },

    {
        name: "dessert",
        displayName: "Tráng miệng",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748331648/Panna-Cotta-1_u46lzr.jpg",
    },
    {
        name: "snack",
        displayName: "Ăn vặt",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748332080/banner-scaled_ix5qie.jpg",
    },
    {
        name: "vegan",
        displayName: "Món chay",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748332195/kenali-perbedaan-vegan-dan-vegetarian_virdla.jpg",
    },
    {
        name: "drinks",
        displayName: "Đồ uống",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748331354/istock_000021309811small_wide-3402a4386afe8d38f0e56bc38dd9c0ed575688b4_tu3sqo.webp",
    },
    {
        name: "noodles",
        displayName: "Mì & Bún",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748331900/Kake-Udon-7549-I-1_lmecm9.jpg",
    },
    {
        name: "rice",
        displayName: "Cơm",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748331976/basmati-rice-recipe_uwbw6v.jpg",
    },
    {
        name: "soup",
        displayName: "Canh",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748332123/13338-quick-and-easy-vegetable-soup-DDMFS-4x3-402702f59e7a41519515cecccaba1b80_vbxslu.webp",
    },
    {
        name: "baking",
        displayName: "Nướng lò",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748331487/food-3048440_960_720_q0zd6a.jpg",
    },
    {
        name: "salad",
        displayName: "Salad",
        image: "https://res.cloudinary.com/dclp1x0cw/image/upload/v1748332011/cach_lam_salad_mayonnaise_0_1_1_1_f3e3a566b6_hhus96.webp",
    },
];

async function seed() {
    try {
        await Category.deleteMany({});
        await Category.insertMany(categories);
        console.log("Đã seed danh mục thành công!");
        process.exit();
    } catch (err) {
        console.error(" Seed thất bại:", err);
        process.exit(1);
    }
}

seed();
