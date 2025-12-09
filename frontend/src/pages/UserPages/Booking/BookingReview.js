import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ORDER_API_URL =
    process.env.REACT_APP_ORDER_API_URL || "http://localhost:8003";
const PAYMENT_API_URL =
    process.env.REACT_APP_PAYMENT_API_URL || "http://localhost:8004";

const StepHeader = ({ currentStep, onStepClick }) => {
    const steps = [
        { id: 1, label: "Chọn chi nhánh" },
        { id: 2, label: "Chọn ngày & giờ" },
        { id: 3, label: "Chọn tầng & bàn" },
        { id: 4, label: "Chọn menu" },
        { id: 5, label: "Xác nhận & thanh toán" },
    ];

    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
                {steps.map((s, index) => {
                    const isDone = currentStep > s.id;
                    const isActive = currentStep === s.id;
                    const isFuture = currentStep < s.id;
                    const isClickable = isDone && typeof onStepClick === "function";
                    return (
                        <div
                            key={s.id}
                            className="d-flex align-items-center mb-2"
                            style={{
                                minWidth: 0,
                                cursor: isClickable ? "pointer" : "default",
                            }}
                            onClick={isClickable ? () => onStepClick(s.id) : undefined}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 8,
                                    backgroundColor: isActive
                                        ? "#8b5e3c"
                                        : isDone
                                        ? "#a97155"
                                        : "#e9ecef",
                                    color: isActive || isDone ? "#fff" : "#6c757d",
                                    fontWeight: 600,
                                }}
                            >
                                {isDone ? "✓" : s.id}
                            </div>
                            <span
                                style={{
                                    fontWeight: isActive ? 600 : 400,
                                    color: isFuture && !isActive ? "#6c757d" : "#212529",
                                }}
                            >
                                {s.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div
                                    style={{
                                        width: 30,
                                        height: 2,
                                        background: currentStep > s.id ? "#a97155" : "#e9ecef",
                                        marginLeft: 8,
                                    }}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BookingReview = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());
    const [paying, setPaying] = useState(false);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`${ORDER_API_URL}/api/bookings/${bookingId}`);
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không lấy được thông tin đặt bàn");
            }
            setBooking(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId]);

    // Bỏ phần fetch lịch sử thanh toán; user xem lịch sử chung ở trang /my-payments

    // cập nhật thời gian hiện tại để hiển thị countdown 15 phút giữ bàn
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return <div className="container my-5">Đang tải thông tin đặt bàn...</div>;
    }

    if (!booking) {
        return <div className="container my-5">Không tìm thấy thông tin đặt bàn.</div>;
    }

    const items = booking.items || [];
    const totalFood = booking.totalFoodPrice || 0;
    const basePrice = booking.basePrice || 0;
    const totalPrice = booking.totalPrice || basePrice + totalFood;

    // Countdown 15 phút giữ bàn cho thanh toán trước tiền bàn
    const PAYMENT_WINDOW_SECONDS = 15 * 60;
    let remainingSeconds = null;
    if (booking.createdAt) {
        const created = new Date(booking.createdAt).getTime();
        const deadline = created + PAYMENT_WINDOW_SECONDS * 1000;
        remainingSeconds = Math.max(0, Math.floor((deadline - now) / 1000));
    }

    const formatCountdown = (seconds) => {
        if (seconds == null) return "--:--";
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handlePayWithMomo = async () => {
        if (!bookingId || paying) return;
        try {
            setPaying(true);
            const res = await fetch(`${PAYMENT_API_URL}/api/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookingId }),
            });
            const data = await res.json();
            if (!res.ok || !data.success || !data.data?.payUrl) {
                throw new Error(data.message || "Không tạo được giao dịch MoMo");
            }
            try {
                if (data.data.payment && data.data.payment._id) {
                    localStorage.setItem(
                        "lastBookingPayment",
                        JSON.stringify({
                            bookingId,
                            paymentId: data.data.payment._id,
                        })
                    );
                }
            } catch (e) {
                // ignore localStorage errors
            }

            window.location.href = data.data.payUrl;
        } catch (error) {
            console.error(error);
            alert(error.message || "Không thể tạo giao dịch thanh toán MoMo");
        } finally {
            setPaying(false);
        }
    };

    const handleStepClick = (stepId) => {
        // Từ màn xác nhận, cho phép quay lại các bước:
        // 1-3: quay về luồng đặt bàn
        // 4: quay lại màn chọn menu của booking hiện tại
        if (stepId >= 1 && stepId <= 3) {
            navigate("/booking");
        } else if (stepId === 4 && bookingId) {
            navigate(`/booking/${bookingId}/menu`);
        }
    };

    return (
        <div className="container my-5">
            <h2 className="mb-3">Đặt bàn tại nhà hàng</h2>
            <StepHeader currentStep={5} onStepClick={handleStepClick} />
            <h3 className="mb-4">Xác nhận đơn đặt bàn #{bookingId}</h3>

            <div className="row">
                <div className="col-lg-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title">Thông tin bàn</h4>
                            <p className="mb-1">Ngày: <strong>{booking.date}</strong></p>
                            <p className="mb-1">Giờ: <strong>{booking.time}</strong></p>
                            <p className="mb-1">Số khách: <strong>{booking.numberOfGuests}</strong></p>
                            {booking.tableType && (
                                <p className="mb-1">Loại bàn: <strong>{booking.tableType}</strong></p>
                            )}
                            <p className="mb-1">Giá bàn: <strong>{basePrice.toLocaleString("vi-VN")} đ</strong></p>
                            {booking.note && (
                                <p className="mt-2 mb-0">Ghi chú: {booking.note}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title">Danh sách món đã chọn</h4>
                            {items.length === 0 && <p>Chưa có món nào.</p>}
                            {items.length > 0 && (
                                <ul className="list-group list-group-flush mb-3">
                                    {items.map((item, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <div>{item.name}</div>
                                                <small className="text-muted">x{item.quantity}</small>
                                            </div>
                                            <div>
                                                {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="d-flex justify-content-between mb-1">
                                <span>Tiền món:</span>
                                <strong>{totalFood.toLocaleString("vi-VN")} đ</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span>Giá bàn:</span>
                                <strong>{basePrice.toLocaleString("vi-VN")} đ</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tổng thanh toán:</span>
                                <strong>{totalPrice.toLocaleString("vi-VN")} đ</strong>
                            </div>

                            {booking.status !== "PAID" ? (
                                <>
                                    {remainingSeconds !== null && (
                                        <div className="mb-2 text-danger">
                                            Thời gian còn lại để giữ bàn: {" "}
                                            <strong>{formatCountdown(remainingSeconds)}</strong>
                                        </div>
                                    )}

                                    <div className="mb-3 text-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={paying || remainingSeconds === 0}
                                            onClick={handlePayWithMomo}
                                        >
                                            {remainingSeconds === 0
                                                ? "Đã hết thời gian giữ bàn"
                                                : paying
                                                ? "Đang tạo giao dịch MoMo..."
                                                : "Thanh toán trực tuyến với MoMo"}
                                        </button>
                                        <p className="mt-2 mb-0">
                                            Sau khi thanh toán thành công trên MoMo, trạng thái đơn sẽ được cập nhật
                                            tự động.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="alert alert-success">
                                    <h5 className="alert-heading">Cảm ơn bạn đã thanh toán!</h5>
                                    <p className="mb-1">
                                        Đơn đặt bàn của bạn đã được xác nhận. Hẹn gặp bạn tại nhà hàng vào lúc {" "}
                                        <strong>
                                            {booking.time} ngày {booking.date}
                                        </strong>
                                        .
                                    </p>
                                    <small className="text-muted">
                                        Nếu cần thay đổi hoặc hủy bàn, bạn có thể gửi yêu cầu trong mục "Bàn đã đặt
                                        của bạn".
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BookingReview;
