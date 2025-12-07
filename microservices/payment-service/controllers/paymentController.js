const Payment = require("../models/Payment");
const axios = require("axios");

// POST /api/payments
// body: { bookingId, method }
const createPayment = async (req, res) => {
    try {
        const { bookingId, method } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Missing bookingId",
            });
        }
        const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://localhost:8003";

        // Lấy thông tin booking từ order-service để:
        // - Kiểm tra tồn tại
        // - Tính số tiền phải trả (không tin amount từ client)
        // - Kiểm tra trạng thái hiện tại
        const bookingRes = await axios.get(
            `${orderServiceUrl}/api/bookings/${bookingId}`
        );
        const bookingData = bookingRes.data;
        if (!bookingRes.data?.success || !bookingRes.data.data) {
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy thông tin đặt bàn để thanh toán",
            });
        }

        const booking = bookingData.data;

        if (booking.status === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Đơn đặt bàn này đã được thanh toán",
            });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Đơn đặt bàn này đã bị hủy, không thể thanh toán",
            });
        }

        // Kiểm tra quá hạn thanh toán 15 phút
        if (booking.paymentExpiresAt && new Date(booking.paymentExpiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Đơn đặt bàn này đã quá hạn thanh toán",
            });
        }

        // Chống thanh toán lặp: nếu đã có payment SUCCESS cho booking này thì không tạo mới
        const existingSuccess = await Payment.findOne({
            bookingId,
            status: "SUCCESS",
        });
        if (existingSuccess) {
            return res.status(400).json({
                success: false,
                message: "Đơn đặt bàn này đã có giao dịch thanh toán thành công",
                data: existingSuccess,
            });
        }

        const totalFoodPrice = booking.totalFoodPrice || 0;
        const basePrice = booking.basePrice || 0;
        const amount = booking.totalPrice || basePrice + totalFoodPrice;

        // Tạo mã giao dịch giả lập để dễ tra cứu
        const transactionId = `MOCK_${Date.now()}_${Math.floor(
            Math.random() * 10000
        )}`;

        // Tạo payment pending với đầy đủ thông tin
        let payment = await Payment.create({
            bookingId,
            amount,
            method: method || "MOCK",
            status: "PENDING",
            transactionId,
        });

        try {
            // Giả lập thanh toán thành công ngay lập tức
            payment.status = "SUCCESS";
            await payment.save();

            // Gọi Order Service để cập nhật trạng thái booking sang PAID
            await axios.post(
                `${orderServiceUrl}/api/bookings/${bookingId}/mark-paid`,
                {
                    amount,
                    paymentId: payment._id,
                }
            );
        } catch (err) {
            console.error("Error finalizing payment or notifying order service:", err.message);
            payment.status = "FAILED";
            await payment.save();

            return res.status(500).json({
                success: false,
                message: "Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ nhà hàng.",
            });
        }

        return res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error("createPayment error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/payments/expired
// body: { bookingId, amount, method }
// Được order-service gọi khi đơn quá hạn để log lịch sử thanh toán thất bại/quá hạn
const createExpiredPayment = async (req, res) => {
    try {
        const { bookingId, amount, method } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Missing bookingId",
            });
        }

        const transactionId = `EXPIRED_${Date.now()}_${Math.floor(
            Math.random() * 10000
        )}`;

        const payment = await Payment.create({
            bookingId,
            amount: typeof amount === "number" ? amount : 0,
            method: method || "MOCK",
            status: "EXPIRED",
            transactionId,
        });

        return res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error("createExpiredPayment error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createPayment,
    createExpiredPayment,
};
