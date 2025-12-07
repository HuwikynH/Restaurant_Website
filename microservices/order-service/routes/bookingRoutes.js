const express = require("express");
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingsByUser,
    getBookingById,
    confirmMenu,
    markPaid,
    requestCancel,
    updateBookingTables,
    cancelBooking,
    deleteBooking,
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/user/:userId", getBookingsByUser);
router.get("/:bookingId", getBookingById);
router.post("/:bookingId/confirm-menu", confirmMenu);
router.post("/:bookingId/mark-paid", markPaid);
router.post("/:bookingId/request-cancel", requestCancel);
router.patch("/:bookingId/table", updateBookingTables);
router.patch("/:bookingId/cancel", cancelBooking);
router.delete("/:bookingId", deleteBooking);

module.exports = router;
