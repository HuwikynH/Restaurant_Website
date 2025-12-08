const express = require("express");
const router = express.Router();
const {
    createPayment,
    createExpiredPayment,
    getPaymentsByBooking,
    getPaymentsByUser,
    completePaymentFromRedirect,
    momoIpn,
} = require("../controllers/paymentController");

router.post("/", createPayment);
router.post("/expired", createExpiredPayment);
router.get("/booking/:bookingId", getPaymentsByBooking);
router.get("/user/:userId", getPaymentsByUser);
router.post("/complete", completePaymentFromRedirect);
router.post("/momo-ipn", momoIpn);

module.exports = router;
