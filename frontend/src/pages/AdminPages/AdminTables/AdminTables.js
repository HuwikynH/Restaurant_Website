import React, { useEffect, useMemo, useState } from "react";

// Tạm thời dùng cùng dữ liệu mock như Booking cho admin quan sát sơ đồ
const branches = [
    {
        id: "branch-q1",
        name: "Nhà hàng Ratatouille - Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP. HCM",
    },
    {
        id: "branch-q7",
        name: "Nhà hàng Ratatouille - Quận 7",
        address: "45 Nguyễn Văn Linh, Quận 7, TP. HCM",
    },
];

// Các khung giờ cố định như rạp chiếu phim
const timeSlots = [
    "17:00",
    "18:00",
    "19:30",
    "21:00",
];

const floors = [
    {
        id: 1,
        name: "Tầng 1",
    },
    {
        id: 2,
        name: "Tầng 2",
    },
];

const inferTablesFromTableType = (tableType) => {
    if (!tableType || typeof tableType !== "string") return [];
    // Tìm các mã bàn dạng B01, B12, C03...
    const matches = tableType.match(/[BC]\d{2}/g);
    if (!matches) return [];
    return matches.map((code) => ({
        code,
        floorId: code.startsWith("B") ? 1 : 2,
        floorName: code.startsWith("B") ? "Tầng 1" : "Tầng 2",
    }));
};

const AdminTables = () => {
    const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || null);
    const [selectedFloorId, setSelectedFloorId] = useState(1);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    });
    const [selectedTime, setSelectedTime] = useState("18:00");
    const [selectedTable, setSelectedTable] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tablesData, setTablesData] = useState([]);
    const [savingTable, setSavingTable] = useState(false);
    const [deletingTableId, setDeletingTableId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const emptyForm = {
        code: "",
        capacity: 4,
        minPrice: 500000,
        type: "normal",
        status: "active",
        note: "",
    };
    const [tableForm, setTableForm] = useState(emptyForm);

    const currentBranch = branches.find((b) => b.id === selectedBranchId);
    const currentFloor = floors.find((f) => f.id === selectedFloorId);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8003/api/bookings");
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Không lấy được danh sách đặt bàn");
                }
                setBookings(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                if (!selectedBranchId) return;
                const res = await fetch(
                    `http://localhost:8003/api/tables?branchId=${selectedBranchId}`
                );
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Không lấy được danh sách bàn");
                }
                setTablesData(data.data || []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTables();
    }, [selectedBranchId]);

    const currentFloorTables = useMemo(() => {
        const byApi = tablesData.filter(
            (t) => t.floorId === selectedFloorId && t.status !== "inactive"
        );
        if (byApi.length > 0) return byApi;

        const fallbackFloor = floors.find((f) => f.id === selectedFloorId);
        return fallbackFloor?.tables || [];
    }, [tablesData, selectedFloorId]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (selectedBranchId && b.branchId && b.branchId !== selectedBranchId) {
                return false;
            }
            if (b.date !== selectedDate) return false;
            if (b.time !== selectedTime) return false;
            return true;
        });
    }, [bookings, selectedBranchId, selectedDate, selectedTime]);

    const bookedTableCodesByFloor = useMemo(() => {
        const map = new Map(); // key: `${floorId}-${code}` -> true
        filteredBookings.forEach((b) => {
            const tables =
                b.tables && b.tables.length
                    ? b.tables
                    : inferTablesFromTableType(b.tableType);
            tables.forEach((t) => {
                if (!t.code) return;
                const key = `${t.floorId || 1}-${t.code}`;
                map.set(key, true);
            });
        });
        return map;
    }, [filteredBookings]);

    const [selectedTableBookings, setSelectedTableBookings] = useState([]);

    const handleEditTable = (table) => {
        setEditMode(true);
        setTableForm({
            code: table.code || "",
            capacity: table.capacity || 4,
            minPrice: table.minPrice || 500000,
            type: table.type || "normal",
            status: table.status || "active",
            note: table.note || "",
        });
        setSelectedFloorId(table.floorId || 1);
        setSelectedTable(table);
    };

    const handleNewTable = () => {
        setEditMode(false);
        setTableForm(emptyForm);
        setSelectedTable(null);
    };

    const reloadTables = async () => {
        try {
            if (!selectedBranchId) return;
            const res = await fetch(
                `http://localhost:8003/api/tables?branchId=${selectedBranchId}`
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không lấy được danh sách bàn");
            }
            setTablesData(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmitTable = async (e) => {
        e.preventDefault();
        if (!selectedBranchId || !selectedFloorId) return;

        const payload = {
            code: tableForm.code.trim(),
            branchId: selectedBranchId,
            branchName: currentBranch?.name,
            floorId: selectedFloorId,
            floorName: currentFloor?.name,
            capacity: Number(tableForm.capacity) || 2,
            minPrice: Number(tableForm.minPrice) || 0,
            type: tableForm.type,
            status: tableForm.status,
            note: tableForm.note,
        };

        if (!payload.code) {
            alert("Vui lòng nhập mã bàn (ví dụ: B01, C05)");
            return;
        }

        try {
            setSavingTable(true);
            const existing = tablesData.find(
                (t) =>
                    t.code === payload.code &&
                    t.branchId === payload.branchId &&
                    t.floorId === payload.floorId
            );

            const url = existing
                ? `http://localhost:8003/api/tables/${existing._id}`
                : "http://localhost:8003/api/tables";
            const method = existing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không lưu được bàn");
            }

            await reloadTables();
            if (!existing) {
                setTableForm(emptyForm);
            }
            alert(existing ? "Đã cập nhật bàn" : "Đã thêm bàn mới");
        } catch (error) {
            console.error(error);
            alert(error.message || "Có lỗi khi lưu bàn");
        } finally {
            setSavingTable(false);
        }
    };

    const handleDeleteTable = async (table) => {
        if (!table?._id) {
            alert("Không tìm thấy ID bàn để xóa");
            return;
        }
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa bàn ${table.code} (${currentFloor?.name})?`
        );
        if (!confirmDelete) return;

        try {
            setDeletingTableId(table._id);
            const res = await fetch(
                `http://localhost:8003/api/tables/${table._id}`,
                {
                    method: "DELETE",
                }
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Không xóa được bàn");
            }
            await reloadTables();
            if (selectedTable && selectedTable._id === table._id) {
                setSelectedTable(null);
                setSelectedTableBookings([]);
            }
            alert("Đã xóa bàn");
        } catch (error) {
            console.error(error);
            alert(error.message || "Có lỗi khi xóa bàn");
        } finally {
            setDeletingTableId(null);
        }
    };

    const bookedTablesList = useMemo(() => {
        const map = new Map(); // key: `${floorId}-${code}` -> { code, floorId, floorName }
        filteredBookings.forEach((b) => {
            const tables =
                b.tables && b.tables.length
                    ? b.tables
                    : inferTablesFromTableType(b.tableType);
            tables.forEach((t) => {
                if (!t.code) return;
                const floorId = t.floorId || 1;
                const key = `${floorId}-${t.code}`;
                if (!map.has(key)) {
                    map.set(key, {
                        code: t.code,
                        floorId,
                        floorName: t.floorName,
                    });
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => {
            if (a.floorId !== b.floorId) return a.floorId - b.floorId;
            return a.code.localeCompare(b.code);
        });
    }, [filteredBookings]);

    const handleSelectTable = (table, floorOverride) => {
        const floorId = floorOverride?.id ?? selectedFloorId;
        const floorName = floorOverride?.name ?? currentFloor?.name;
        const enriched = {
            ...table,
            floorId,
            floorName,
        };
        setSelectedTable(enriched);

        const bookingsForTable = filteredBookings.filter((b) =>
            (b.tables || []).some(
                (t) =>
                    t.code === table.code &&
                    (t.floorId || floorId) === floorId
            )
        );
        setSelectedTableBookings(bookingsForTable);
    };

    return (
        <div className="container my-4">
            <h2 className="mb-3">Sơ đồ bàn - Quản lý (Admin)</h2>

            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label mb-1" style={{ fontSize: 13 }}>
                                Chi nhánh
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={selectedBranchId || ""}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                            >
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label mb-1" style={{ fontSize: 13 }}>
                                Ngày
                            </label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label mb-1" style={{ fontSize: 13 }}>
                                Giờ (khung cố định)
                            </label>
                            <div>
                                {timeSlots.map((slot) => {
                                    const active = selectedTime === slot;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            className="btn btn-sm me-2 mb-1"
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

                        <div className="col-md-5">
                            <label className="form-label mb-1" style={{ fontSize: 13 }}>
                                Tầng
                            </label>
                            <div>
                                {floors.map((f) => {
                                    const active = selectedFloorId === f.id;
                                    return (
                                        <button
                                            key={f.id}
                                            type="button"
                                            className="btn btn-sm me-2 mb-1"
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
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="mb-2 d-flex justify-content-between" style={{ fontSize: 13 }}>
                        <div>
                            <strong>Chú thích:</strong> &nbsp;
                            <span className="badge bg-success me-1">Bàn trống</span>
                            <span className="badge bg-secondary me-1">Đã đặt</span>
                            <span className="badge bg-danger me-1">Bàn VIP</span>
                            <span className="badge bg-purple me-1" style={{ backgroundColor: "#6f42c1" }}>Bàn SVIP</span>
                        </div>
                        <div className="text-muted">
                            Lối vào ở phía dưới · Cửa sổ ở phía trên sơ đồ
                        </div>
                    </div>

                    <div className="mb-2" style={{ fontSize: 12 }}>
                        <strong>Bàn đã đặt trong khung giờ này:</strong>
                        {bookedTablesList.length === 0 ? (
                            <span className="text-muted ms-1">Chưa có</span>
                        ) : (
                            <div className="mt-1 d-flex flex-wrap" style={{ gap: 6 }}>
                                {bookedTablesList.map((t) => {
                                    const isActive =
                                        selectedTable &&
                                        selectedTable.code === t.code &&
                                        selectedTable.floorId === t.floorId;
                                    return (
                                        <button
                                            key={`${t.floorId}-${t.code}`}
                                            type="button"
                                            className={`btn btn-sm px-2 py-0 ${
                                                isActive
                                                    ? "btn-primary"
                                                    : "btn-outline-secondary"
                                            }`}
                                            onClick={() => {
                                                setSelectedFloorId(t.floorId);
                                                handleSelectTable(t, {
                                                    id: t.floorId,
                                                    name: t.floorName,
                                                });
                                            }}
                                        >
                                            {t.floorName || `Tầng ${t.floorId}`} - {t.code}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
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
                                const isBookedMock = t.status === "booked";
                                const isBooked = isBookedByData || isBookedMock;
                                const isVip = t.status === "vip" || t.type === "vip";
                                const isSvip = t.type === "svip";

                                let bg = "#e9f7ef";
                                let border = "#28a745";
                                if (isBooked) {
                                    bg = "#e9ecef";
                                    border = "#ced4da";
                                }
                                if (isVip) {
                                    bg = "#fdecea";
                                    border = "#dc3545";
                                }
                                if (isSvip) {
                                    bg = "#f3e8ff";
                                    border = "#6f42c1";
                                }

                                return (
                                    <div
                                        key={t.code}
                                        className="p-2"
                                        style={{
                                            border: `2px solid ${border}`,
                                            borderRadius: 6,
                                            backgroundColor: bg,
                                            cursor: "pointer",
                                            textAlign: "center",
                                            fontSize: 11,
                                        }}
                                        title={
                                            isBooked
                                                ? "Bàn đã được đặt trong khung giờ này"
                                                : t.note || ""
                                        }
                                        onClick={() => handleSelectTable(t)}
                                    >
                                        <div className="d-flex justify-content-center align-items-center mb-1">
                                            <strong>{t.code}</strong>
                                            {isVip && (
                                                <span style={{ fontSize: 12, marginLeft: 4 }}>⭐</span>
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
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="card-title mb-0" style={{ fontSize: 16 }}>
                                    Bố trí bàn (CRUD)
                                </h5>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={handleNewTable}
                                >
                                    + Bàn mới
                                </button>
                            </div>

                            <form onSubmit={handleSubmitTable} style={{ fontSize: 13 }}>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <label className="form-label mb-1">Mã bàn</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={tableForm.code}
                                            onChange={(e) =>
                                                setTableForm({
                                                    ...tableForm,
                                                    code: e.target.value.toUpperCase(),
                                                })
                                            }
                                            placeholder="B01, C05..."
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label mb-1">Sức chứa</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="form-control form-control-sm"
                                            value={tableForm.capacity}
                                            onChange={(e) =>
                                                setTableForm({
                                                    ...tableForm,
                                                    capacity: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label mb-1">Min (đ)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={50000}
                                            className="form-control form-control-sm"
                                            value={tableForm.minPrice}
                                            onChange={(e) =>
                                                setTableForm({
                                                    ...tableForm,
                                                    minPrice: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="row g-2 mt-1">
                                    <div className="col-4">
                                        <label className="form-label mb-1">Loại</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={tableForm.type}
                                            onChange={(e) =>
                                                setTableForm({
                                                    ...tableForm,
                                                    type: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="normal">Thường</option>
                                            <option value="vip">VIP</option>
                                            <option value="svip">SVIP</option>
                                            <option value="private">Phòng riêng</option>
                                        </select>
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label mb-1">Trạng thái</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={tableForm.status}
                                            onChange={(e) =>
                                                setTableForm({
                                                    ...tableForm,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="active">Đang dùng</option>
                                            <option value="inactive">Ẩn / Ngưng dùng</option>
                                        </select>
                                    </div>
                                    <div className="col-4 d-flex align-items-end">
                                        <button
                                            type="submit"
                                            className="btn btn-sm btn-success w-100"
                                            disabled={savingTable}
                                        >
                                            {savingTable
                                                ? "Đang lưu..."
                                                : editMode
                                                ? "Cập nhật"
                                                : "Thêm bàn"}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <label className="form-label mb-1">Ghi chú</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows={2}
                                        value={tableForm.note}
                                        onChange={(e) =>
                                            setTableForm({
                                                ...tableForm,
                                                note: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body" style={{ maxHeight: 260, overflowY: "auto" }}>
                            <h6 className="card-title" style={{ fontSize: 14 }}>
                                Danh sách bàn ({currentFloor?.name})
                            </h6>
                            {currentFloorTables.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: 13 }}>
                                    Chưa có bàn nào cho tầng này.
                                </p>
                            ) : (
                                <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                                    <thead>
                                        <tr>
                                            <th>Mã</th>
                                            <th>SC</th>
                                            <th>Min</th>
                                            <th>Loại</th>
                                            <th className="text-end">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFloorTables.map((t) => (
                                            <tr key={t._id || t.code}>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link btn-sm p-0"
                                                        onClick={() => handleEditTable(t)}
                                                    >
                                                        {t.code}
                                                    </button>
                                                </td>
                                                <td>{t.capacity}</td>
                                                <td>{t.minPrice.toLocaleString("vi-VN")}</td>
                                                <td>
                                                    {t.type === "vip"
                                                        ? "VIP"
                                                        : t.type === "svip"
                                                        ? "SVIP"
                                                        : t.type === "private"
                                                        ? "Phòng"
                                                        : "Thường"}
                                                </td>
                                                <td className="text-end">
                                                    <div
                                                        className="d-inline-flex align-items-center"
                                                        style={{ gap: 8 }}
                                                    >
                                                        {/* Sửa bàn: đưa vào form bên trên */}
                                                        <button
                                                            type="button"
                                                            title="Sửa bàn"
                                                            onClick={() => handleEditTable(t)}
                                                            style={{
                                                                border: "none",
                                                                background: "transparent",
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <i
                                                                className="bx bx-edit"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    fontSize: 16,
                                                                    color: "#0d6efd",
                                                                }}
                                                            ></i>
                                                        </button>

                                                        {/* Xóa bàn */}
                                                        <button
                                                            type="button"
                                                            title="Xóa bàn"
                                                            onClick={() => handleDeleteTable(t)}
                                                            disabled={deletingTableId === t._id}
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
                                                                    fontSize: 16,
                                                                    color: "#dc3545",
                                                                    opacity:
                                                                        deletingTableId === t._id
                                                                            ? 0.6
                                                                            : 1,
                                                                }}
                                                            ></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTables;
