const Table = require("../models/Table");

// GET /api/tables
const getTables = async (req, res) => {
    try {
        const { branchId, floorId } = req.query;
        const filter = {};
        if (branchId) filter.branchId = branchId;
        if (floorId) filter.floorId = Number(floorId);

        const tables = await Table.find(filter).sort({ branchId: 1, floorId: 1, code: 1 });
        return res.json({ success: true, data: tables });
    } catch (error) {
        console.error("getTables error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/tables
const createTable = async (req, res) => {
    try {
        const table = await Table.create(req.body);
        return res.status(201).json({ success: true, data: table });
    } catch (error) {
        console.error("createTable error:", error);
        if (error.code === 11000) {
            return res
                .status(400)
                .json({ success: false, message: "Bàn với mã này đã tồn tại trong tầng/chi nhánh" });
        }
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// PUT /api/tables/:id
const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findByIdAndUpdate(id, req.body, { new: true });
        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }
        return res.json({ success: true, data: table });
    } catch (error) {
        console.error("updateTable error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE /api/tables/:id
const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findByIdAndDelete(id);
        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }
        return res.json({ success: true, data: table });
    } catch (error) {
        console.error("deleteTable error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getTables,
    createTable,
    updateTable,
    deleteTable,
};
