import React, { useEffect, useState, useMemo } from "react";

const ORDER_API_URL =
    process.env.REACT_APP_ORDER_API_URL || "http://localhost:8003";
const PAYMENT_API_URL =
    process.env.REACT_APP_PAYMENT_API_URL || "http://localhost:8004";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchText, setSearchText] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [userMap, setUserMap] = useState({}); // userId -> user info

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${ORDER_API_URL}/api/bookings`);
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không lấy được danh sách đặt bàn");
            }
            const list = data.data || [];
            setBookings(list);

            // Nạp thông tin user để hiển thị tên thay vì userId
            const ids = Array.from(
                new Set(list.map((b) => b.userId).filter(Boolean))
            );
            const newMap = {};

            const token = localStorage.getItem("token");

            await Promise.all(
                ids.map(async (id) => {
                    try {
                        const resUser = await fetch(
                            `${process.env.REACT_APP_API_URL}/api/users/admin/users/${id}`,
                            {
                                headers: token
                                    ? {
                                          Authorization: `Bearer ${token}`,
                                      }
                                    : {},
                            }
                        );
                        if (!resUser.ok) return;
                        const raw = await resUser.json();
                        const userData = raw?.data || raw?.user || raw;
                        newMap[id] = userData || {};
                    } catch (e) {
                        // ignore single user error
                    }
                })
            );
            setUserMap(newMap);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMarkPaid = async (bookingId) => {
        try {
            setUpdatingId(bookingId);
            const res = await fetch(`${PAYMENT_API_URL}/api/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookingId }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không thể đánh dấu đã thanh toán");
            }
            await fetchAllBookings();
        } catch (error) {
            console.error(error);
            alert(error.message || "Không thể đánh dấu đã thanh toán");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (bookingId) => {
        const ok = window.confirm("Bạn có chắc muốn xóa đặt bàn này?");
        if (!ok) return;

        try {
            setUpdatingId(bookingId);
            const res = await fetch(
                `${ORDER_API_URL}/api/bookings/${bookingId}`,
                {
                    method: "DELETE",
                }
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không thể xóa đặt bàn");
            }
            await fetchAllBookings();
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (statusFilter !== "ALL" && b.status !== statusFilter) {
                return false;
            }

            if (!searchText.trim()) return true;

            const text = searchText.trim().toLowerCase();
            const user = userMap[b.userId] || {};
            const displayName =
                user.fullName || user.name || user.username || b.userId || "";
            return (
                (b._id || "").toLowerCase().includes(text) ||
                displayName.toLowerCase().includes(text) ||
                (b.tableType || "").toLowerCase().includes(text)
            );
        });
    }, [bookings, statusFilter, searchText, userMap]);

    const renderStatusBadge = (status, booking) => {
        if (!status) return <span className="badge bg-secondary">N/A</span>;

        const normalized = status.toUpperCase();
        if (normalized === "PAID") {
            return <span className="badge bg-success">Đã thanh toán</span>;
        }
        if (normalized === "PENDING_PAYMENT") {
            return (
                <span className="badge bg-warning text-dark">Chờ thanh toán</span>
            );
        }
        if (normalized === "PENDING_MENU") {
            return (
                <span className="badge bg-info text-dark">Chờ chọn menu</span>
            );
        }
        if (normalized === "CANCELLED") {
            return <span className="badge bg-secondary">Đã hủy</span>;
        }

        if (booking?.cancelRequested) {
            return (
                <span className="badge bg-warning text-dark">
                    {status} · Yêu cầu hủy
                </span>
            );
        }

        return <span className="badge bg-secondary">{status}</span>;
    };

    const getUserDisplayName = (userId) => {
        if (!userId) return "-";
        const user = userMap[userId] || {};
        const name = user.fullName || user.name || user.username;
        if (name) return name;

        // Nếu chưa lấy được tên, hiển thị mã rút gọn cho đỡ dài
        const idStr = String(userId);
        if (idStr.length <= 10) return idStr;
        return `${idStr.slice(0, 6)}...${idStr.slice(-4)}`;
    };

    if (loading) {
        return <div className="container my-4">Đang tải danh sách đặt bàn...</div>;
    }

    return (
        <div className="container my-4">
            <h2 className="mb-3">Quản lý đặt bàn</h2>

            <div className="card mb-3">
                <div className="card-body py-2">
                    <div
                        className="d-flex flex-wrap align-items-end"
                        style={{ gap: 16 }}
                    >
                        <div>
                            <label className="form-label mb-1" style={{ fontSize: 13 }}>
                                Lọc theo trạng thái
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ minWidth: 180 }}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="PENDING_MENU">Chờ chọn menu</option>
                                <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                                <option value="PAID">Đã thanh toán</option>
                            </select>
                        </div>

                        <div className="flex-grow-1" style={{ minWidth: 260 }}>
                            <label className="form-label mb-1" style={{ fontSize: 13 }}>
                                Tìm kiếm (Mã đặt bàn / User / Loại bàn)
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Nhập từ khóa..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <p>Không tìm thấy đặt bàn nào với bộ lọc hiện tại.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                {/* Mã đặt bàn ẩn khỏi UI, vẫn dùng _id nội bộ */}
                                <th style={{ width: 160, display: "none" }}>Mã đặt bàn</th>
                                <th style={{ minWidth: 220 }}>Khách hàng</th>
                                <th>Ngày</th>
                                <th>Giờ</th>
                                <th>Số khách</th>
                                <th style={{ width: 260 }}>Loại bàn</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Tổng tiền</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((b) => {
                                const canMarkPaid = b.status !== "PAID";
                                const canApproveCancel =
                                    b.status !== "CANCELLED" && b.cancelRequested;
                                return (
                                    <tr key={b._id}>
                                        <td style={{ display: "none" }}>{b._id}</td>
                                        <td
                                            style={{
                                                maxWidth: 260,
                                                fontSize: 13,
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                            }}
                                            title={getUserDisplayName(b.userId)}
                                        >
                                            {getUserDisplayName(b.userId)}
                                        </td>
                                        <td>{b.date}</td>
                                        <td>{b.time}</td>
                                        <td>{b.numberOfGuests}</td>
                                        <td
                                            style={{
                                                maxWidth: 260,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            title={b.tableType}
                                        >
                                            {b.tableType}
                                        </td>
                                        <td>{renderStatusBadge(b.status, b)}</td>
                                        <td className="text-end">
                                            {(b.totalPrice || 0).toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                                            <div className="d-inline-flex align-items-center" style={{ gap: 8 }}>
                                                {/* Xem chi tiết */}
                                                <a
                                                    href={`/booking/${b._id}/review`}
                                                    title="Xem chi tiết"
                                                >
                                                    <i
                                                        className="bx bx-show"
                                                        style={{ cursor: "pointer", fontSize: 18 }}
                                                    ></i>
                                                </a>

                                                {/* Đánh dấu đã thanh toán */}
                                                <button
                                                    type="button"
                                                    title="Đánh dấu đã thanh toán"
                                                    disabled={!canMarkPaid || updatingId === b._id}
                                                    onClick={() => handleMarkPaid(b._id)}
                                                    style={{
                                                        border: "none",
                                                        background: "transparent",
                                                        padding: 0,
                                                    }}
                                                >
                                                    <i
                                                        className="bx bx-check-circle"
                                                        style={{
                                                            cursor: canMarkPaid ? "pointer" : "default",
                                                            fontSize: 18,
                                                            color:
                                                                b.status === "PAID"
                                                                    ? "#28a745"
                                                                    : "#6c757d",
                                                        }}
                                                    ></i>
                                                </button>

                                                {/* Chấp nhận hủy nếu có yêu cầu */}
                                                {canApproveCancel && (
                                                    <button
                                                        type="button"
                                                        title="Chấp nhận hủy theo yêu cầu"
                                                        disabled={updatingId === b._id}
                                                        onClick={async () => {
                                                            const ok = window.confirm(
                                                                "Xác nhận hủy đặt bàn này theo yêu cầu của khách?"
                                                            );
                                                            if (!ok) return;
                                                            try {
                                                                setUpdatingId(b._id);
                                                                const res = await fetch(
                                                                    `http://localhost:8003/api/bookings/${b._id}/cancel`,
                                                                    { method: "PATCH" }
                                                                );
                                                                const data = await res.json();
                                                                if (!res.ok || !data.success) {
                                                                    throw new Error(
                                                                        data.message ||
                                                                            "Không thể hủy đặt bàn"
                                                                    );
                                                                }
                                                                await fetchAllBookings();
                                                            } catch (e) {
                                                                console.error(e);
                                                                alert(
                                                                    e.message ||
                                                                        "Có lỗi xảy ra khi hủy đặt bàn"
                                                                );
                                                            } finally {
                                                                setUpdatingId(null);
                                                            }
                                                        }}
                                                        style={{
                                                            border: "none",
                                                            background: "transparent",
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <i
                                                            className="bx bx-x-circle"
                                                            style={{
                                                                cursor: "pointer",
                                                                fontSize: 18,
                                                                color: "#dc3545",
                                                            }}
                                                        ></i>
                                                    </button>
                                                )}

                                                {/* Xoá booking */}
                                                <button
                                                    type="button"
                                                    title="Xóa đặt bàn"
                                                    disabled={updatingId === b._id}
                                                    onClick={() => handleDelete(b._id)}
                                                    style={{
                                                        border: "none",
                                                        background: "transparent",
                                                        padding: 0,
                                                    }}
                                                >
                                                    <i
                                                        className="bx bx-trash"
                                                        style={{
                                                            cursor: "pointer",
                                                            fontSize: 18,
                                                            color: "#dc3545",
                                                        }}
                                                    ></i>
                                                </button>
                                            </div>
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

export default AdminBookings;
