const Booking = require("../models/Booking");
const axios = require("axios");

// POST /api/bookings
const createBooking = async (req, res) => {
    try {
        const {
            userId,
            date,
            time,
            numberOfGuests,
            tableType,
            basePrice,
            note,
            branchId,
            branchName,
            tables,
        } = req.body;

        if (!userId || !date || !time || !numberOfGuests) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (userId, date, time, numberOfGuests)",
            });
        }

        const booking = await Booking.create({
            userId,
            date,
            time,
            numberOfGuests,
            tableType,
            basePrice: basePrice || 0,
            note,
            branchId,
            branchName,
            tables: Array.isArray(tables) ? tables : [],
        });

        return res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error("createBooking error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/bookings/:bookingId/request-cancel
// User gửi yêu cầu hủy, admin sẽ duyệt và gọi cancelBooking sau
const requestCancel = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Booking đã bị hủy trước đó",
            });
        }

        booking.cancelRequested = true;
        await booking.save();

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("requestCancel error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/bookings (admin)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        return res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("getAllBookings error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/bookings/user/:userId
const getBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("getBookingsByUser error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/bookings/:bookingId
const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("getBookingById error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/bookings/:bookingId/confirm-menu
const confirmMenu = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Gọi Cart Service để lấy giỏ món của bàn
        const cartServiceUrl = process.env.CART_SERVICE_URL || "http://localhost:8002";
        const cartRes = await axios.get(`${cartServiceUrl}/api/cart/${bookingId}`);
        const cartData = cartRes.data;

        if (!cartData.success || !cartData.data) {
            return res.status(400).json({
                success: false,
                message: "Không lấy được giỏ món để chốt menu",
            });
        }

        const items = cartData.data.items || [];
        if (!items.length) {
            return res.status(400).json({
                success: false,
                message: "Giỏ món đang trống, không thể chốt menu",
            });
        }

        const totalFoodPrice = items.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
        );

        const basePrice = booking.basePrice || 0;
        const totalPrice = basePrice + totalFoodPrice;

        booking.items = items;
        booking.totalFoodPrice = totalFoodPrice;
        booking.totalPrice = totalPrice;
        booking.status = "PENDING_PAYMENT";
        booking.paymentStatus = "PENDING";
        booking.paymentExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await booking.save();

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("confirmMenu error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/bookings/:bookingId/mark-paid
const markPaid = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        booking.status = "PAID";
        booking.paymentStatus = "PAID";
        await booking.save();

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("markPaid error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /api/bookings/:bookingId/table
// Đổi danh sách bàn cho một booking, kiểm tra trùng bàn trong cùng branch + date + time
const updateBookingTables = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { tables, tableType, basePrice } = req.body;

        if (!Array.isArray(tables) || tables.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh sách bàn mới không hợp lệ",
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Booking đã bị hủy, không thể đổi bàn",
            });
        }

        const branchId = booking.branchId;
        const { date, time } = booking;
        const tableCodes = tables.map((t) => t.code).filter(Boolean);

        if (tableCodes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh sách bàn mới không hợp lệ",
            });
        }

        // Tìm các booking khác trong cùng branch + date + time đang dùng trùng bàn
        const conflictQuery = {
            _id: { $ne: booking._id },
            date,
            time,
            status: { $ne: "CANCELLED" },
        };
        if (branchId) {
            conflictQuery.branchId = branchId;
        }

        conflictQuery["tables.code"] = { $in: tableCodes };

        const conflict = await Booking.findOne(conflictQuery);
        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "Một hoặc nhiều bàn đã được đặt trong khung giờ này",
            });
        }

        booking.tables = tables;
        if (typeof tableType === "string") {
            booking.tableType = tableType;
        }
        if (typeof basePrice === "number") {
            booking.basePrice = basePrice;
        }

        await booking.save();

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("updateBookingTables error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /api/bookings/:bookingId/cancel
// Đánh dấu booking là CANCELLED (user hoặc admin hủy)
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.status === "CANCELLED") {
            return res.json({ success: true, data: booking });
        }

        booking.status = "CANCELLED";
        booking.cancelRequested = false;
        await booking.save();

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("cancelBooking error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE /api/bookings/:bookingId (admin)
const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByIdAndDelete(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error("deleteBooking error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
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
};
