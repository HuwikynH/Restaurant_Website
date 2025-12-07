const express = require("express");
const router = express.Router();
const { getCartByBooking, addOrUpdateItem } = require("../controllers/cartController");

router.get("/:bookingId", getCartByBooking);
router.post("/:bookingId/items", addOrUpdateItem);

module.exports = router;
