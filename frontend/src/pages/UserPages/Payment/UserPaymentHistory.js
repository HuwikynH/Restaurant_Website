import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAYMENT_API_URL =
    process.env.REACT_APP_PAYMENT_API_URL || "http://localhost:8004";

const UserPaymentHistory = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let userId = null;
        try {
            const rawUser = localStorage.getItem("user");
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                userId = parsed?._id || parsed?.id || null;
            }
        } catch (e) {
            // ignore
        }

        if (!userId) {
            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
        }

        const fetchPayments = async () => {
            try {
                const res = await fetch(
                    `${PAYMENT_API_URL}/api/payments/user/${userId}`
                );
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Không lấy được lịch sử thanh toán");
                }
                const rawList = Array.isArray(data.data) ? data.data : [];

                // Chỉ lấy giao dịch mới nhất cho mỗi bookingId
                const latestByBooking = new Map();
                for (const p of rawList) {
                    const key = p.bookingId;
                    if (!key) continue;
                    if (!latestByBooking.has(key)) {
                        latestByBooking.set(key, p);
                    }
                }

                setPayments(Array.from(latestByBooking.values()));
            } catch (err) {
                setError(err.message || "Đã xảy ra lỗi khi tải lịch sử thanh toán");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const formatDateTime = (value) => {
        if (!value) return "-";
        try {
            return new Date(value).toLocaleString("vi-VN");
        } catch (e) {
            return String(value);
        }
    };

    const formatCurrency = (value) => {
        const num = typeof value === "number" ? value : Number(value) || 0;
        return num.toLocaleString("vi-VN") + " đ";
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4">Lịch sử thanh toán của bạn</h2>

            {loading && <p>Đang tải lịch sử thanh toán...</p>}

            {!loading && error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && payments.length === 0 && (
                <p>Bạn chưa có giao dịch thanh toán nào.</p>
            )}

            {!loading && !error && payments.length > 0 && (
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Số tiền</th>
                                        <th>Phương thức</th>
                                        <th>Trạng thái</th>
                                        <th>Mã giao dịch</th>
                                        <th>Bàn / chi nhánh</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p._id}>
                                            <td>{formatDateTime(p.createdAt)}</td>
                                            <td>{formatCurrency(p.amount)}</td>
                                            <td>{p.method || "-"}</td>
                                            <td>{p.status}</td>
                                            <td>{p.transactionId || "-"}</td>
                                            <td>
                                                {p.booking ? (
                                                    <>
                                                        <div>
                                                            {p.booking.branchName || ""}
                                                        </div>
                                                        <small className="text-muted">
                                                            {p.booking.time} {" "}
                                                            {p.booking.date}
                                                        </small>
                                                    </>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm p-0"
                                                    onClick={() =>
                                                        navigate(
                                                            `/booking/${p.bookingId}/review`
                                                        )
                                                    }
                                                >
                                                    Xem đơn đặt bàn
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPaymentHistory;
