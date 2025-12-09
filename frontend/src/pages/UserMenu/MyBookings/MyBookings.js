import React, { useEffect, useState } from "react";

const ORDER_API_URL =
    process.env.REACT_APP_ORDER_API_URL || "http://localhost:8003";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [now, setNow] = useState(Date.now());

    const fetchBookings = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?._id || user?.id;
            if (!userId) {
                setLoading(false);
                return;
            }

            const res = await fetch(
                `${ORDER_API_URL}/api/bookings/user/${userId}`
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không lấy được danh sách bàn đã đặt");
            }
            setBookings(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // cập nhật thời gian hiện tại để tính countdown 15 phút cho các đơn chờ thanh toán
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCancel = async (booking) => {
        const confirm = window.confirm(
            `Bạn muốn gửi yêu cầu hủy đặt bàn ngày ${booking.date} lúc ${booking.time}? Admin sẽ duyệt yêu cầu này.`
        );
        if (!confirm) return;

        try {
            setCancellingId(booking._id);
            const res = await fetch(
                `${ORDER_API_URL}/api/bookings/${booking._id}/request-cancel`,
                {
                    method: "POST",
                }
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không gửi được yêu cầu hủy");
            }
            await fetchBookings();
            alert("Đã gửi yêu cầu hủy, vui lòng chờ admin duyệt.");
        } catch (error) {
            console.error(error);
            alert(error.message || "Có lỗi xảy ra khi gửi yêu cầu hủy");
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return <div className="container my-5">Đang tải danh sách bàn đã đặt...</div>;
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4">Bàn đã đặt của bạn</h2>
            {bookings.length === 0 ? (
                <p>Bạn chưa có bàn nào. Hãy đặt bàn ngay hôm nay!</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Bàn</th>
                                <th>Ngày</th>
                                <th>Giờ</th>
                                <th>Số khách</th>
                                <th>Loại bàn</th>
                                <th>Trạng thái</th>
                                <th>Tổng tiền</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => {
                                const tableLabel =
                                    b.tables && b.tables.length
                                        ? b.tables
                                              .map((t) => `${t.floorName || ""} ${t.code}`.trim())
                                              .join(", ")
                                        : b.tableType || "(Chưa có thông tin bàn)";

                                const isCancelled = b.status === "CANCELLED";
                                const isPendingCancel = b.cancelRequested && !isCancelled;

                                // Countdown 15 phút cho đơn chờ thanh toán
                                const PAYMENT_WINDOW_SECONDS = 15 * 60;
                                let remainingSeconds = null;
                                if (b.createdAt) {
                                    const created = new Date(b.createdAt).getTime();
                                    const deadline = created + PAYMENT_WINDOW_SECONDS * 1000;
                                    remainingSeconds = Math.max(
                                        0,
                                        Math.floor((deadline - now) / 1000)
                                    );
                                }

                                const formatCountdown = (seconds) => {
                                    if (seconds == null) return "--:--";
                                    const m = Math.floor(seconds / 60)
                                        .toString()
                                        .padStart(2, "0");
                                    const s = (seconds % 60).toString().padStart(2, "0");
                                    return `${m}:${s}`;
                                };

                                const isPendingPayment = b.status === "PENDING_PAYMENT";

                                return (
                                    <tr key={b._id}>
                                        <td>{tableLabel}</td>
                                        <td>{b.date}</td>
                                        <td>{b.time}</td>
                                        <td>{b.numberOfGuests}</td>
                                        <td>{b.tableType}</td>
                                        <td>
                                            {b.status}
                                            {isPendingPayment && remainingSeconds !== null && (
                                                <div className="small text-danger">
                                                    Cần thanh toán trước: {" "}
                                                    {formatCountdown(remainingSeconds)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {(b.totalPrice || 0).toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="text-nowrap">
                                            <a
                                                href={`/booking/${b._id}/review`}
                                                className="btn btn-sm btn-outline-primary me-2"
                                            >
                                                Xem chi tiết
                                            </a>

                                            {isPendingPayment && (
                                                <a
                                                    href={
                                                        remainingSeconds === 0
                                                            ? undefined
                                                            : `/booking/${b._id}/review`
                                                    }
                                                    className={`btn btn-sm me-2 ${
                                                        remainingSeconds === 0
                                                            ? "btn-secondary disabled"
                                                            : "btn-warning"
                                                    }`}
                                                    style={{ color: "#000" }}
                                                >
                                                    {remainingSeconds === 0
                                                        ? "Đã hết hạn giữ bàn"
                                                        : `Tiếp tục thanh toán (${formatCountdown(
                                                              remainingSeconds
                                                          )})`}
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                disabled={
                                                    isCancelled ||
                                                    isPendingCancel ||
                                                    cancellingId === b._id
                                                }
                                                onClick={() => handleCancel(b)}
                                            >
                                                {isCancelled
                                                    ? "Đã hủy"
                                                    : isPendingCancel
                                                    ? "Đã gửi yêu cầu"
                                                    : cancellingId === b._id
                                                    ? "Đang gửi..."
                                                    : "Yêu cầu hủy"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
