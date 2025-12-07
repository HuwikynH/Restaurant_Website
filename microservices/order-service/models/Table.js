const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
    {
        code: { type: String, required: true }, // B01, C05...
        branchId: { type: String, required: true },
        branchName: { type: String },
        floorId: { type: Number, required: true },
        floorName: { type: String },
        capacity: { type: Number, required: true, min: 1 },
        minPrice: { type: Number, default: 0 },
        type: {
            type: String,
            enum: ["normal", "vip", "svip", "private"],
            default: "normal",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        note: { type: String },
    },
    { timestamps: true }
);

// Đảm bảo mỗi bàn là duy nhất trong 1 chi nhánh + tầng
tableSchema.index({ branchId: 1, floorId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
