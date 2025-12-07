const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        note: { type: String },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        bookingId: { type: String, required: true },
        userId: { type: String, required: true },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
