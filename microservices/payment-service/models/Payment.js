const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        bookingId: { type: String, required: true },
        amount: { type: Number, required: true },
        method: { type: String, default: "MOCK" },
        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED", "EXPIRED"],
            default: "PENDING",
        },
        transactionId: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
