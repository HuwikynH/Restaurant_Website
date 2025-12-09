import React, { useEffect, useState } from "react";

const PAYMENT_API_URL =
    process.env.REACT_APP_PAYMENT_API_URL || "http://localhost:8004";
import { useNavigate } from "react-router-dom";

const PaymentResult = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("pending");
    const [message, setMessage] = useState("Đang xác nhận kết quả thanh toán...");
    const [bookingId, setBookingId] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resultCode = params.get("resultCode");
        const momoMessage = params.get("message");
        const extraData = params.get("extraData");

        let parsedBookingId = null;
        let paymentId = null;

        // Ưu tiên lấy từ localStorage do chính frontend lưu trước khi redirect
        try {
            const stored = localStorage.getItem("lastBookingPayment");
            if (stored) {
                const parsed = JSON.parse(stored);
                parsedBookingId = parsed.bookingId || null;
                paymentId = parsed.paymentId || null;
            }
        } catch (e) {
            // ignore
        }

        // Fallback: nếu localStorage không có thì thử decode extraData từ MoMo
        if (!parsedBookingId && extraData) {
            try {
                const decoded = decodeURIComponent(extraData);
                const jsonStr = atob(decoded);
                const parsedExtra = JSON.parse(jsonStr);
                if (!parsedBookingId && parsedExtra.bookingId) {
                    parsedBookingId = parsedExtra.bookingId;
                }
                if (!paymentId && parsedExtra.paymentId) {
                    paymentId = parsedExtra.paymentId;
                }
            } catch (e) {
                // ignore lỗi decode extraData
            }
        }

        setBookingId(parsedBookingId);

        const confirmPayment = async () => {
            try {
                const res = await fetch(`${PAYMENT_API_URL}/api/payments/complete`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bookingId: parsedBookingId,
                        paymentId,
                        resultCode,
                    }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Không thể xác nhận thanh toán");
                }
                setStatus("success");
                setMessage(
                    momoMessage ||
                        "Thanh toán thành công! Đơn đặt bàn đã được cập nhật trạng thái PAID."
                );

                if (parsedBookingId) {
                    // Điều hướng ngay về trang chi tiết đơn đặt bàn
                    navigate(`/booking/${parsedBookingId}/review`, { replace: true });
                }
            } catch (error) {
                setStatus("error");
                setMessage(
                    error.message || "Thanh toán không thành công hoặc không được xác nhận."
                );
            }
        };

        if (parsedBookingId) {
            confirmPayment();
        } else {
            setStatus("error");
            setMessage("Thiếu thông tin booking trong kết quả thanh toán.");
        }
    }, [navigate]);

    return (
        <div className="container my-5">
            <h2 className="mb-3">Kết quả thanh toán MoMo</h2>
            <div
                className={`alert ${
                    status === "success"
                        ? "alert-success"
                        : status === "error"
                        ? "alert-danger"
                        : "alert-info"
                }`}
            >
                {message}
            </div>
            {bookingId && status !== "success" && (
                <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={() => navigate(`/booking/${bookingId}/review`)}
                >
                    Quay lại chi tiết đơn đặt bàn
                </button>
            )}
        </div>
    );
};

export default PaymentResult;
