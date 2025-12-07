const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        note: { type: String },
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        date: { type: String, required: true }, // yyyy-mm-dd
        time: { type: String, required: true }, // HH:mm
        numberOfGuests: { type: Number, required: true, min: 1 },

        // Thông tin chi nhánh & bàn để admin có thể quản lý theo sơ đồ
        branchId: { type: String },
        branchName: { type: String },
        tables: {
            type: [
                new mongoose.Schema(
                    {
                        code: { type: String, required: true }, // B01, C02...
                        floorId: { type: Number },
                        floorName: { type: String },
                    },
                    { _id: false }
                ),
            ],
            default: [],
        },

        tableType: { type: String },
        basePrice: { type: Number, default: 0 },
        items: { type: [bookingItemSchema], default: [] },
        totalFoodPrice: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["PENDING_MENU", "PENDING_PAYMENT", "PAID", "CANCELLED"],
            default: "PENDING_MENU",
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "EXPIRED"],
            default: "PENDING",
        },
        paymentExpiresAt: { type: Date },
        cancelRequested: { type: Boolean, default: false },
        note: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
