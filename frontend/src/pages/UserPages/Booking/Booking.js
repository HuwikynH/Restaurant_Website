import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const branches = [
    {
        id: "branch-q1",
        name: "Nhà hàng Ratatouille - Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP. HCM",
        openHours: "10:00 - 22:00",
        status: "",
    },
    {
        id: "branch-q7",
        name: "Nhà hàng Ratatouille - Quận 7",
        address: "45 Nguyễn Văn Linh, Quận 7, TP. HCM",
        openHours: "10:00 - 22:30",
        status: "",
    },
];

const floors = [
    {
        id: 1,
        name: "Tầng 1",
        tables: [
            { code: "B01", capacity: 2, minPrice: 300000, status: "available", note: "Gần cửa sổ" },
            { code: "B02", capacity: 4, minPrice: 500000, status: "available", note: "Gần cửa sổ" },
            { code: "B03", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B04", capacity: 6, minPrice: 700000, status: "vip", note: "Bàn VIP, view đẹp" },
            { code: "B05", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B06", capacity: 4, minPrice: 500000, status: "booked", note: "Đã đặt" },
            { code: "B07", capacity: 2, minPrice: 300000, status: "available", note: "Gần lối đi" },
            { code: "B08", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "B09", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B10", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B11", capacity: 2, minPrice: 300000, status: "available", note: "Gần cửa" },
            { code: "B12", capacity: 6, minPrice: 900000, status: "vip", note: "VIP, view toàn sảnh" },
            { code: "B13", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B14", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B15", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "B16", capacity: 2, minPrice: 300000, status: "available", note: "Gần lối đi" },
            { code: "B17", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B18", capacity: 4, minPrice: 500000, status: "booked", note: "Đã đặt" },
            { code: "B19", capacity: 2, minPrice: 300000, status: "available", note: "" },
            { code: "B20", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "B21", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B22", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B23", capacity: 2, minPrice: 300000, status: "available", note: "Gần cửa" },
            { code: "B24", capacity: 6, minPrice: 900000, status: "vip", note: "VIP, góc đẹp" },
            { code: "B25", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B26", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B27", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "B28", capacity: 2, minPrice: 300000, status: "available", note: "Gần lối đi" },
            { code: "B29", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B30", capacity: 4, minPrice: 500000, status: "booked", note: "Đã đặt" },
            { code: "B31", capacity: 2, minPrice: 300000, status: "available", note: "" },
            { code: "B32", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "B33", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B34", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "B35", capacity: 2, minPrice: 300000, status: "available", note: "Gần cửa" },
            { code: "B36", capacity: 6, minPrice: 950000, status: "vip", note: "VIP, trung tâm sảnh" },
        ],
    },
    {
        id: 2,
        name: "Tầng 2",
        tables: [
            { code: "C01", capacity: 4, minPrice: 500000, status: "available", note: "Khu yên tĩnh" },
            { code: "C02", capacity: 4, minPrice: 500000, status: "available", note: "Khu yên tĩnh" },
            { code: "C03", capacity: 6, minPrice: 800000, status: "available", note: "Gần sân khấu" },
            { code: "C04", capacity: 2, minPrice: 300000, status: "available", note: "Bàn đôi" },
            { code: "C05", capacity: 4, minPrice: 500000, status: "booked", note: "Đã đặt" },
            { code: "C06", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "C07", capacity: 6, minPrice: 850000, status: "vip", note: "Phòng riêng nhỏ" },
            { code: "C08", capacity: 2, minPrice: 300000, status: "available", note: "Gần ban công" },
            { code: "C09", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "C10", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "C11", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "C12", capacity: 2, minPrice: 300000, status: "available", note: "Gần lối đi" },
            { code: "C13", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "C14", capacity: 4, minPrice: 500000, status: "booked", note: "Đã đặt" },
            { code: "C15", capacity: 2, minPrice: 300000, status: "available", note: "" },
            { code: "C16", capacity: 6, minPrice: 800000, status: "available", note: "" },
            { code: "C17", capacity: 4, minPrice: 500000, status: "available", note: "" },
            { code: "C18", capacity: 4, minPrice: 500000, status: "available", note: "" },
        ],
    },
];

// Các khung giờ cố định (có thể đồng bộ với AdminTables)
const timeSlots = ["17:00", "18:00", "19:30", "21:00"];

const inferTablesFromTableType = (tableType) => {
    if (!tableType || typeof tableType !== "string") return [];
    const matches = tableType.match(/[BC]\d{2}/g);
    if (!matches) return [];
    return matches.map((code) => ({
        code,
        floorId: code.startsWith("B") ? 1 : 2,
        floorName: code.startsWith("B") ? "Tầng 1" : "Tầng 2",
    }));
};

const Booking = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedFloorId, setSelectedFloorId] = useState(1);
    const [selectedTables, setSelectedTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tablesData, setTablesData] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;

    const today = new Date();
    const days = Array.from({ length: 5 }).map((_, idx) => {
        const d = new Date();
        d.setDate(today.getDate() + idx);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        const dayNames = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]; // Chủ nhật đầu
        const label = idx === 0 ? "Hôm nay" : `${dayNames[d.getDay()]} ${day}/${month}`;
        return {
            value: `${year}-${month}-${day}`,
            label,
        };
    });

    const currentFloor = floors.find((f) => f.id === selectedFloorId);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                if (!selectedBranch) return;
                setLoadingTables(true);
                const res = await fetch(
                    `${ORDER_API_URL}/api/tables?branchId=${selectedBranch.id}`
                );
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Không lấy được danh sách bàn");
                }
                setTablesData(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingTables(false);
            }
        };

        fetchTables();
    }, [selectedBranch]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!selectedBranch || !selectedDate || !selectedTime) return;
                setLoadingBookings(true);
                const res = await fetch(`${ORDER_API_URL}/api/bookings`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Không lấy được danh sách đặt bàn");
                }
                setBookings(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingBookings(false);
            }
        };

        fetchBookings();
    }, [selectedBranch, selectedDate, selectedTime]);

    const currentFloorTables = useMemo(() => {
        const byApi = tablesData.filter(
            (t) => t.floorId === selectedFloorId && t.status !== "inactive"
        );
        if (byApi.length > 0) return byApi;

        return currentFloor?.tables || [];
    }, [tablesData, selectedFloorId, currentFloor]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (selectedBranch && b.branchId && b.branchId !== selectedBranch.id) {
                return false;
            }
            if (selectedDate && b.date !== selectedDate) return false;
            if (selectedTime && b.time !== selectedTime) return false;
            return true;
        });
    }, [bookings, selectedBranch, selectedDate, selectedTime]);

    const bookedTableCodesByFloor = useMemo(() => {
        const map = new Map();
        filteredBookings.forEach((b) => {
            const tables =
                b.tables && b.tables.length ? b.tables : inferTablesFromTableType(b.tableType);
            tables.forEach((t) => {
                if (!t.code) return;
                const key = `${t.floorId || 1}-${t.code}`;
                map.set(key, true);
            });
        });
        return map;
    }, [filteredBookings]);

    const toggleTable = (table) => {
        if (table.status === "booked") return;

        const exists = selectedTables.find(
            (t) => t.code === table.code && t.floorId === selectedFloorId
        );
        if (exists) {
            setSelectedTables((prev) =>
                prev.filter(
                    (t) => !(t.code === table.code && t.floorId === selectedFloorId)
                )
            );
        } else {
            setSelectedTables((prev) => [
                ...prev,
                {
                    floorId: selectedFloorId,
                    floorName: currentFloor?.name,
                    ...table,
                },
            ]);
        }
    };

    const removeSelectedTable = (idx) => {
        setSelectedTables((prev) => prev.filter((_, i) => i !== idx));
    };

    const totalMinPrice = selectedTables.reduce((sum, t) => sum + (t.minPrice || 0), 0);
    const totalCapacity = selectedTables.reduce((sum, t) => sum + (t.capacity || 0), 0) || 2;

    const handleCreateBooking = async (redirectTo = "menu") => {
        if (!userId) {
            toast.info("Vui lòng đăng nhập để đặt bàn.", { autoClose: 2500 });
            return;
        }

        if (!selectedBranch || !selectedDate || !selectedTime || !selectedTables.length) {
            toast.info("Vui lòng chọn đủ chi nhánh, ngày, giờ và ít nhất 1 bàn.");
            return;
        }

        try {
            setLoading(true);

            const tableSummary = selectedTables
                .map((t) => `${t.floorName} - ${t.code} (${t.capacity} người)`)
                .join(", ");

            const res = await fetch(`${ORDER_API_URL}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDate,
                    time: selectedTime,
                    numberOfGuests: totalCapacity,
                    tableType: `${selectedBranch.name} - ${tableSummary}`,
                    basePrice: totalMinPrice,
                    note: `Chi nhánh: ${selectedBranch.name} - ${selectedBranch.address}`,
                    userId,
                    branchId: selectedBranch.id,
                    branchName: selectedBranch.name,
                    tables: selectedTables.map((t) => ({
                        code: t.code,
                        floorId: t.floorId,
                        floorName: t.floorName,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Đặt bàn thất bại");
            }

            if (redirectTo === "menu") {
                toast.success("Đã chọn bàn, tiếp tục chọn món!", { autoClose: 2000 });
            } else {
                toast.success("Đã đặt bàn, bạn có thể chọn món tại nhà hàng.", {
                    autoClose: 2000,
                });
            }
            const bookingId = data?.data?._id;
            if (bookingId) {
                if (redirectTo === "menu") {
                    navigate(`/booking/${bookingId}/menu`);
                } else if (redirectTo === "review") {
                    navigate(`/booking/${bookingId}/review`);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Có lỗi xảy ra", { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const canGoStep2 = !!selectedBranch;
    const canGoStep3 = !!selectedBranch && !!selectedDate && !!selectedTime;

    const renderStepHeader = () => {
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
                        const isDone = step > s.id;
                        const isActive = step === s.id;
                        const isFuture = step < s.id;
                        const isClickable = isDone; // chỉ cho quay lại các bước đã hoàn thành
                        return (
                            <div
                                key={s.id}
                                className="d-flex align-items-center mb-2"
                                style={{
                                    minWidth: 0,
                                    cursor: isClickable ? "pointer" : "default",
                                }}
                                onClick={isClickable ? () => setStep(s.id) : undefined}
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
                                            ? "#8b5e3c" // primary brown
                                            : isDone
                                            ? "#a97155" // lighter brown for completed
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
                                            background:
                                                step > s.id ? "#a97155" : "#e9ecef",
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

    const renderStep1 = () => (
        <div className="row">
            <div className="col-lg-8">
                <h4 className="mb-3">1. Chọn chi nhánh nhà hàng</h4>
                <div className="row g-3">
                    {branches.map((b) => {
                        const active = selectedBranch?.id === b.id;
                        return (
                            <div className="col-md-6" key={b.id}>
                                <div
                                    className="card h-100"
                                    style={{
                                        borderColor: active ? "#8b5e3c" : "#dee2e6",
                                        boxShadow: active
                                            ? "0 0 0 2px rgba(139,94,60,.25)"
                                            : "none",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedBranch(b)}
                                >
                                    <div className="card-body">
                                        <h5 className="card-title d-flex justify-content-between align-items-center">
                                            <span>{b.name}</span>
                                            {active && <span style={{ color: "#8b5e3c" }}>✓</span>}
                                        </h5>
                                        <p className="mb-1">{b.address}</p>
                                        <p className="mb-1">Giờ mở cửa: {b.openHours}</p>
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            style={{
                                                backgroundColor: "#8b5e3c",
                                                color: "#fff",
                                                borderColor: "#8b5e3c",
                                            }}
                                        >
                                            Chọn chi nhánh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="col-lg-4 mt-4 mt-lg-0">
                <div className="card h-100">
                    <div className="card-body">
                        <h5>Bản đồ / Hình ảnh minh hoạ</h5>
                        <p className="text-muted" style={{ fontSize: 14 }}>
                            Khu vực này có thể hiển thị bản đồ, hình ảnh không gian
                            nhà hàng, hoặc thông tin nổi bật của chi nhánh.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div>
            <h4 className="mb-3">2. Chọn ngày & khung giờ</h4>
            <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                    {days.map((d) => {
                        const active = selectedDate === d.value;
                        return (
                            <button
                                key={d.value}
                                type="button"
                                className="btn btn-sm me-2 mb-2"
                                style={{
                                    backgroundColor: active ? "#8b5e3c" : "transparent",
                                    color: active ? "#fff" : "#495057",
                                    borderColor: active ? "#8b5e3c" : "#ced4da",
                                }}
                                onClick={() => {
                                    setSelectedDate(d.value);
                                    setSelectedTime(null);
                                }}
                            >
                                {d.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div>
                    <p className="mb-2">Chọn khung giờ:</p>
                    <div className="d-flex flex-wrap gap-2">
                        {timeSlots.map((slot) => {
                            const active = selectedTime === slot;
                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    className="btn btn-sm me-2 mb-2"
                                    style={{
                                        backgroundColor: active ? "#8b5e3c" : "transparent",
                                        color: active ? "#fff" : "#495057",
                                        borderColor: active ? "#8b5e3c" : "#ced4da",
                                    }}
                                    onClick={() => setSelectedTime(slot)}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="row">
            <div className="col-lg-8">
                <h4 className="mb-3">3. Chọn tầng & bàn</h4>
                <div className="mb-1">
                    {floors.map((f) => {
                        const active = selectedFloorId === f.id;
                        return (
                            <button
                                key={f.id}
                                type="button"
                                className="btn btn-sm me-2 mb-2"
                                style={{
                                    backgroundColor: active ? "#8b5e3c" : "transparent",
                                    color: active ? "#fff" : "#495057",
                                    borderColor: active ? "#8b5e3c" : "#ced4da",
                                }}
                                onClick={() => setSelectedFloorId(f.id)}
                            >
                                {f.name}
                            </button>
                        );
                    })}
                </div>

                <div className="mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}>
                    <div>
                        <strong>Chú thích:</strong> &nbsp;
                        <span className="badge bg-success me-1">Bàn trống</span>
                        <span className="badge bg-secondary me-1">Đã đặt</span>
                        <span className="badge bg-warning text-dark me-1">Bàn đang chọn</span>
                        <span className="badge bg-danger me-1">Bàn VIP</span>
                        <span className="badge bg-purple me-1" style={{ backgroundColor: "#6f42c1" }}>
                            Bàn SVIP
                        </span>
                    </div>
                    <div className="text-muted">Lối vào ở phía dưới · Cửa sổ ở phía trên sơ đồ</div>
                </div>

                <div
                    style={{
                        border: "1px solid #dee2e6",
                        borderRadius: 12,
                        padding: 20,
                        backgroundColor: "#f8f9fa",
                        minHeight: 320,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Nhãn cửa sổ */}
                    <div
                        style={{
                            position: "absolute",
                            top: 6,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 11,
                            color: "#0c5460",
                            backgroundColor: "#d1ecf1",
                            padding: "2px 10px",
                            borderRadius: 999,
                            border: "1px solid #bee5eb",
                        }}
                    >
                        Cửa sổ
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, 1fr)",
                            columnGap: 20,
                            rowGap: 24,
                            marginTop: 32,
                            marginBottom: 32,
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        {currentFloorTables.map((t) => {
                            const key = `${selectedFloorId}-${t.code}`;
                            const isBookedByData = bookedTableCodesByFloor.get(key);
                            const isSelected = selectedTables.some(
                                (st) => st.code === t.code && st.floorId === selectedFloorId
                            );
                            const isBookedMock = t.status === "booked";
                            const isBooked = isBookedByData || isBookedMock;
                            const isVip = t.status === "vip" || t.type === "vip";
                            const isSvip = t.type === "svip";

                            // Mặc định: bàn trống
                            let bg = "#e9f7ef";
                            let border = "#28a745";

                            // VIP/SVIP chỉ áp dụng khi bàn chưa bị đặt
                            if (!isBooked && isVip) {
                                bg = "#fdecea";
                                border = "#dc3545";
                            }
                            if (!isBooked && isSvip) {
                                bg = "#f3e8ff";
                                border = "#6f42c1";
                            }

                            // Bàn đã đặt luôn xám, ưu tiên cao nhất
                            if (isBooked) {
                                bg = "#e9ecef";
                                border = "#ced4da";
                            }

                            // Bàn đang được user chọn
                            if (isSelected) {
                                bg = "#fff3cd";
                                border = "#ffc107";
                            }

                            return (
                                <div
                                    key={t.code}
                                    className="p-2"
                                    style={{
                                        border: `2px solid ${border}`,
                                        borderRadius: 6,
                                        backgroundColor: bg,
                                        cursor: isBooked ? "not-allowed" : "pointer",
                                        textAlign: "center",
                                        fontSize: 11,
                                    }}
                                    title={
                                        isBooked
                                            ? "Bàn đã được đặt ở khung giờ này"
                                            : t.note || ""
                                    }
                                    onClick={() => {
                                        if (isBooked) return;
                                        toggleTable(t);
                                    }}
                                >
                                    <div className="d-flex justify-content-center align-items-center mb-1">
                                        <strong>{t.code}</strong>
                                        {isVip && <span style={{ fontSize: 12, marginLeft: 4 }}>⭐</span>}
                                        {isSvip && (
                                            <span style={{ fontSize: 12, marginLeft: 4 }}>✨</span>
                                        )}
                                    </div>
                                    <div>👥 {t.capacity} người</div>
                                    <div>Min: {t.minPrice.toLocaleString("vi-VN")}đ</div>
                                </div>
                            );
                        })}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: 6,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 11,
                            color: "#856404",
                            backgroundColor: "#fff3cd",
                            padding: "2px 10px",
                            borderRadius: 999,
                            border: "1px solid #ffeeba",
                        }}
                    >
                        Lối vào
                    </div>
                </div>
            </div>

            <div className="col-lg-4 mt-4 mt-lg-0">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">Bàn đã chọn</h5>
                        {selectedTables.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: 14 }}>
                                Chưa chọn bàn nào. Hãy bấm vào sơ đồ để chọn bàn.
                            </p>
                        ) : (
                            <ul className="list-unstyled mb-3" style={{ fontSize: 14 }}>
                                {selectedTables.map((t, idx) => (
                                    <li
                                        key={`${t.floorId}-${t.code}-${idx}`}
                                        className="d-flex justify-content-between align-items-center mb-1"
                                    >
                                        <div>
                                            <strong>
                                                {t.floorName} - Bàn {t.code}
                                            </strong>
                                            <div className="text-muted">
                                                {t.capacity} người · Min {" "}
                                                {t.minPrice.toLocaleString("vi-VN")}đ
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-link text-danger"
                                            onClick={() => removeSelectedTable(idx)}
                                        >
                                            Xoá
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                            <span>Tổng tối thiểu (ước tính)</span>
                            <strong>{totalMinPrice.toLocaleString("vi-VN")}đ</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span>Số khách dự kiến</span>
                            <strong>{totalCapacity} người</strong>
                        </div>

                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-success"
                                disabled={loading || selectedTables.length === 0}
                                onClick={() => handleCreateBooking("menu")}
                            >
                                {loading
                                    ? "Đang tạo đặt bàn..."
                                    : "Tiếp tục - Chọn menu"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={loading || selectedTables.length === 0}
                                onClick={() => handleCreateBooking("review")}
                            >
                                {loading
                                    ? "Đang tạo đặt bàn..."
                                    : "Bỏ qua menu - Thanh toán tiền bàn"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container my-5">
            <h2 className="mb-3">Đặt bàn tại nhà hàng</h2>
            {renderStepHeader()}

            <div className="mb-4">
                <div className="btn-group" role="group" aria-label="Steps">
                    {[1, 2, 3].map((id) => {
                        const labels = {
                            1: "Bước 1: Chi nhánh",
                            2: "Bước 2: Ngày & giờ",
                            3: "Bước 3: Tầng & bàn",
                        };
                        const isActive = step === id;
                        const disabled = id === 2 ? !canGoStep2 : id === 3 ? !canGoStep3 : false;
                        const canClick = id === 1 || (id === 2 && canGoStep2) || (id === 3 && canGoStep3);
                        return (
                            <button
                                key={id}
                                type="button"
                                className="btn btn-sm"
                                style={{
                                    backgroundColor: isActive ? "#8b5e3c" : "#fff",
                                    color: isActive ? "#fff" : "#8b5e3c",
                                    borderColor: "#8b5e3c",
                                }}
                                disabled={disabled}
                                onClick={() => canClick && setStep(id)}
                            >
                                {labels[id]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="mt-4 d-flex justify-content-between">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={step === 1}
                    onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                >
                    Quay lại
                </button>
                {step < 3 && (
                    <button
                        type="button"
                        className="btn"
                        style={{
                            backgroundColor: "#8b5e3c",
                            color: "#fff",
                            borderColor: "#8b5e3c",
                        }}
                        onClick={() => {
                            if (step === 1 && !canGoStep2) {
                                toast.info("Vui lòng chọn một chi nhánh trước.");
                                return;
                            }
                            if (step === 2 && !canGoStep3) {
                                toast.info("Vui lòng chọn ngày và giờ.");
                                return;
                            }
                            setStep((prev) => Math.min(3, prev + 1));
                        }}
                    >
                        Tiếp tục
                    </button>
                )}
            </div>
        </div>
    );
};

export default Booking;
