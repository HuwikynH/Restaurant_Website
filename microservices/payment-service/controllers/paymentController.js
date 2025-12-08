const Payment = require("../models/Payment");
const axios = require("axios");
const crypto = require("crypto");

// POST /api/payments
// body: { bookingId, method }
// Tạo giao dịch thanh toán qua MoMo sandbox, trả về payUrl cho frontend redirect
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

        // Tạo bản ghi payment ở trạng thái PENDING
        const payment = await Payment.create({
            bookingId,
            amount,
            method: method || "MOMO",
            status: "PENDING",
        });

        try {
            // Chuẩn bị tham số gửi sang MoMo sandbox (captureWallet)
            const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
            const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
            const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
            const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";
            const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:3000";
            const ipnUrl = process.env.MOMO_IPN_URL || "http://localhost:8004/api/payments/momo-ipn";

            const requestId = partnerCode + Date.now();
            const orderId = payment._id.toString();
            const orderInfo = `Thanh toan booking ${bookingId}`;
            const requestType = "captureWallet";

            const extraData = Buffer.from(
                JSON.stringify({ bookingId, paymentId: payment._id })
            ).toString("base64");

            // raw signature giống ví dụ MoMo: accessKey=&amount=&extraData=&ipnUrl=&orderId=&orderInfo=&partnerCode=&redirectUrl=&requestId=&requestType=
            const rawSignature =
                "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

            const signature = crypto
                .createHmac("sha256", secretKey)
                .update(rawSignature)
                .digest("hex");

            const requestBody = {
                partnerCode,
                accessKey,
                requestId,
                amount: String(amount),
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang: "vi",
            };

            const momoRes = await axios.post(endpoint, requestBody, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { payUrl, resultCode, message } = momoRes.data || {};

            if (resultCode !== 0 || !payUrl) {
                console.error("MoMo create payment error:", momoRes.data);
                return res.status(400).json({
                    success: false,
                    message: message || "Không tạo được giao dịch MoMo",
                });
            }

            return res.status(201).json({
                success: true,
                data: {
                    payment,
                    payUrl,
                },
            });
        } catch (err) {
            console.error("Error creating MoMo payment:", err.message || err);
            return res.status(500).json({
                success: false,
                message: "Không tạo được giao dịch thanh toán. Vui lòng thử lại sau.",
            });
        }
    } catch (error) {
        console.error("createPayment error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/payments/booking/:bookingId
// Lấy danh sách lịch sử thanh toán theo bookingId
const getPaymentsByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Missing bookingId",
            });
        }

        const payments = await Payment.find({ bookingId }).sort({ createdAt: -1 });

        return res.json({ success: true, data: payments });
    } catch (error) {
        console.error("getPaymentsByBooking error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/payments/user/:userId
// Lấy toàn bộ lịch sử thanh toán của một user dựa trên các booking của user đó
const getPaymentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId",
            });
        }

        const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://localhost:8003";

        // Lấy danh sách booking của user từ order-service
        const bookingsRes = await axios.get(
            `${orderServiceUrl}/api/bookings/user/${userId}`
        );
        const bookingsData = bookingsRes.data;

        if (!bookingsData?.success || !Array.isArray(bookingsData.data)) {
            return res.status(400).json({
                success: false,
                message: "Không lấy được danh sách booking của user",
            });
        }

        const bookings = bookingsData.data;
        const bookingIds = bookings.map((b) => b._id).filter(Boolean);

        if (!bookingIds.length) {
            return res.json({ success: true, data: [] });
        }

        // Lấy toàn bộ payments có bookingId thuộc danh sách bookingIds
        const payments = await Payment.find({ bookingId: { $in: bookingIds } }).sort({
            createdAt: -1,
        });

        // Gắn thêm một số thông tin booking cơ bản cho tiện hiển thị FE
        const bookingMap = bookings.reduce((acc, b) => {
            acc[b._id] = {
                date: b.date,
                time: b.time,
                branchName: b.branchName,
                totalPrice: b.totalPrice,
                status: b.status,
            };
            return acc;
        }, {});

        const paymentsWithBooking = payments.map((p) => ({
            ...p.toObject(),
            booking: bookingMap[p.bookingId] || null,
        }));

        return res.json({ success: true, data: paymentsWithBooking });
    } catch (error) {
        console.error("getPaymentsByUser error:", error?.response?.data || error);
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

// POST /api/payments/complete
// body: { bookingId, paymentId, resultCode }
// Được frontend gọi sau khi MoMo redirect về, dùng như một IPN đơn giản trong môi trường localhost
const completePaymentFromRedirect = async (req, res) => {
    try {
        const { bookingId, paymentId, resultCode } = req.body || {};

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Missing bookingId",
            });
        }

        // Tìm payment theo paymentId hoặc bookingId, ưu tiên paymentId
        let payment = null;
        if (paymentId) {
            payment = await Payment.findById(paymentId);
        }
        if (!payment) {
            payment = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });
        }

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch thanh toán để cập nhật",
            });
        }

        // Nếu đã SUCCESS thì không làm gì nữa
        if (payment.status === "SUCCESS") {
            return res.json({ success: true, data: payment });
        }

        const isSuccess = Number(resultCode) === 0 || resultCode === "0";

        if (!isSuccess) {
            payment.status = "FAILED";
            await payment.save();
            return res.json({ success: true, data: payment });
        }

        payment.status = "SUCCESS";
        if (!payment.transactionId) {
            payment.transactionId = String(payment._id);
        }
        await payment.save();

        const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://localhost:8003";

        try {
            await axios.post(
                `${orderServiceUrl}/api/bookings/${bookingId}/mark-paid`,
                {
                    amount: payment.amount,
                    paymentId: payment._id,
                }
            );
        } catch (e) {
            console.error("Error notifying order service from completePayment:", e.message);
        }

        return res.json({ success: true, data: payment });
    } catch (error) {
        console.error("completePaymentFromRedirect error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /api/payments/momo-ipn
// Nhận callback từ MoMo sau khi thanh toán (sandbox), cập nhật trạng thái payment & booking
const momoIpn = async (req, res) => {
    try {
        const data = req.body || {};
        const { resultCode, extraData, orderId } = data;

        let bookingId = null;
        let paymentId = null;
        if (extraData) {
            try {
                const decoded = JSON.parse(Buffer.from(extraData, "base64").toString("utf8"));
                bookingId = decoded.bookingId;
                paymentId = decoded.paymentId;
            } catch (e) {
                // ignore parse error
            }
        }

        if (!paymentId) {
            // thử fallback từ orderId nếu cần
            paymentId = orderId;
        }

        if (!paymentId) {
            return res.status(400).json({ success: false });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false });
        }

        if (resultCode === 0) {
            payment.status = "SUCCESS";
            payment.transactionId = payment.transactionId || String(orderId || "");
            await payment.save();

            const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://localhost:8003";
            const targetBookingId = bookingId || payment.bookingId;

            try {
                await axios.post(
                    `${orderServiceUrl}/api/bookings/${targetBookingId}/mark-paid`,
                    {
                        amount: payment.amount,
                        paymentId: payment._id,
                    }
                );
            } catch (e) {
                console.error("Error notifying order service from IPN:", e.message);
            }
        } else {
            payment.status = "FAILED";
            await payment.save();
        }

        // MoMo yêu cầu trả về JSON success để không retry thêm
        return res.json({ success: true });
    } catch (error) {
        console.error("momoIpn error:", error);
        return res.status(500).json({ success: false });
    }
};

module.exports = {
    createPayment,
    createExpiredPayment,
    getPaymentsByBooking,
    getPaymentsByUser,
    completePaymentFromRedirect,
    momoIpn,
};
