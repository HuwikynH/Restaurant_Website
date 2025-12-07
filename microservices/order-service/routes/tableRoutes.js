const express = require("express");
const router = express.Router();

const {
    getTables,
    createTable,
    updateTable,
    deleteTable,
} = require("../controllers/tableController");

// Tạm thời chưa gắn middleware auth/admin, có thể thêm sau
router.get("/", getTables);
router.post("/", createTable);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

module.exports = router;
