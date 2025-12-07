const express = require("express");
const router = express.Router();
const { createPayment, createExpiredPayment } = require("../controllers/paymentController");

router.post("/", createPayment);
router.post("/expired", createExpiredPayment);

module.exports = router;
