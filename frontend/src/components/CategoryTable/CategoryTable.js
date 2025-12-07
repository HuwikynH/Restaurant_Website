import React, { useState, useEffect } from "react";
import "./CategoryTable.css";
import { DataGrid } from "@mui/x-data-grid";
import { viVN } from "@mui/x-data-grid/locales";
import {
    Box,
    Typography,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Paper,
    Alert,
    Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

import CategoryEditAdmin from "../../components/CategoryEditAdmin/CategoryEditAdmin";
import CategoryAddAdmin from "../../components/CategoryAddAdmin/CategoryAddAdmin";

const paginationModel = { page: 0, pageSize: 10 };

export default function CategoryTable() {
    const [rows, setRows] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    const [openEdit, setOpenEdit] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);

    const handleViewCategory = async (id) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/api/categories/${id}`);
            const data = await res.json();
            setSelectedCategory(data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Lỗi khi lấy danh mục:", err);
        }
    };

    const handleEditCategory = async (id) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/api/categories/${id}`);
            const data = await res.json();
            setSelectedCategory(data);
            setOpenEdit(true);
        } catch (err) {
            console.error("Lỗi khi lấy danh mục:", err);
        }
    };

    const handleDeleteCategory = (id) => {
        setCategoryToDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteCategory = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${process.env.REACT_APP_PRODUCT_API_URL}/api/categories/${categoryToDeleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            console.log("Kết quả xoá:", data);

            if (res.ok) {
                // Cập nhật lại danh sách danh mục
                setRows((prev) => prev.filter((cat) => cat.id !== categoryToDeleteId));
                setSuccessMessage("Xoá danh mục thành công");
            } else {
                setErrorMessage(data.msg || "Không thể xoá danh mục");
            }
        } catch (err) {
            console.error("Lỗi khi xoá danh mục:", err);
            setErrorMessage("Lỗi kết nối server");
        } finally {
            setDeleteConfirmOpen(false);
            setCategoryToDeleteId(null);
        }
    };

    const columns = [
        {
            field: "image",
            headerName: "Ảnh",
            width: 90,
            headerAlign: "center",
            renderCell: (params) => (
                <img
                    src={params.row.image}
                    alt=""
                    style={{ width: 60, height: 40, marginLeft: "8px" }}
                />
            ),
        },
        { field: "displayName", headerName: "Tên hiển thị", width: 200 },
        { field: "name", headerName: "Slug", width: 200 },

        {
            field: "createdAt",
            headerName: "Tạo lúc",
            width: 120,
        },
        {
            field: "updatedAt",
            headerName: "Cập nhật",
            width: 120,
        },
        {
            field: "actions",
            headerName: "Hành động",
            width: 140,
            renderCell: (params) => (
                <div className="action-button-category-table">
                    <Tooltip title="Xem" placement="top">
                        <i
                            className="bx bx-show"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleViewCategory(params.row.id)}
                        ></i>
                    </Tooltip>
                    <Tooltip title="Sửa" placement="top">
                        <i
                            className="bx bx-edit"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleEditCategory(params.row.id)}
                        ></i>
                    </Tooltip>
                    <Tooltip title="Xóa" placement="top">
                        <i
                            className="bx bx-trash"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteCategory(params.row.id)}
                        ></i>
                    </Tooltip>
                </div>
            ),
        },
    ];
    // get all categories
    const fetchCategories = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/api/categories`);
            const data = await res.json();
            const formatted = data.map((cat) => ({
                id: cat._id,
                name: cat.name,
                displayName: cat.displayName,
                image: cat.image,

                createdAt: new Date(cat.createdAt).toLocaleDateString("vi-VN"),
                updatedAt: new Date(cat.updatedAt).toLocaleDateString("vi-VN"),
            }));
            setRows(formatted);
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <Paper className="table-wrapper" sx={{ maxHeight: "80vh", width: "90%" }}>
            <Box className="table-toolbar">
                <Typography className="table-title">Danh sách danh mục</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: "12px",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        boxShadow: 2,
                        backgroundColor: "#4a4a48",
                        "&:hover": {
                            backgroundColor: "black",
                        },
                    }}
                    onClick={() => setOpenAdd(true)}
                >
                    + THÊM
                </Button>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                // checkboxSelection
                sx={{
                    border: 0,
                    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                        outline: "none",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: "bold",
                    },
                }}
                localeText={{
                    ...viVN.components.MuiDataGrid.defaultProps.localeText,
                    noRowsLabel: "Không có dữ liệu",
                    footerRowSelected: () => "",
                    // count === 1 ? "Đã chọn 1 dòng" : `Đã chọn ${count} dòng`,
                    footerPaginationLabelRowsPerPage: "Số dòng mỗi trang",
                    footerPaginationLabelDisplayedRows: ({ from, to, count }) =>
                        `${from}–${to} trong ${count}`,
                }}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <IconButton
                        onClick={() => setOpenDialog(false)}
                        style={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedCategory && (
                        <div>
                            <h2>{selectedCategory.displayName}</h2>
                            <img
                                src={selectedCategory.image}
                                alt="Ảnh danh mục"
                                style={{ width: "100%" }}
                            />
                            <p>{selectedCategory.description}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* edit category */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <IconButton
                        onClick={() => setOpenEdit(false)}
                        style={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <CategoryEditAdmin
                        category={selectedCategory}
                        onClose={() => setOpenEdit(false)}
                        onUpdateSuccess={fetchCategories}
                    />
                </DialogContent>
            </Dialog>
            {/* add category */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <IconButton
                        onClick={() => setOpenAdd(false)}
                        style={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <CategoryAddAdmin
                        onClose={() => setOpenAdd(false)}
                        onUpdateSuccess={fetchCategories}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Xác nhận xoá</DialogTitle>
                <DialogContent>Bạn có chắc chắn muốn xoá danh mục này không?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                        Huỷ
                    </Button>
                    <Button
                        onClick={confirmDeleteCategory}
                        color="error"
                        variant="contained"
                        sx={{
                            backgroundColor: "#222", // Màu đen
                            color: "#fff", // Chữ trắng
                            "&:hover": {
                                backgroundColor: "#4a4a48", // Khi hover thì đen nhẹ hơn
                            },
                        }}
                    >
                        Xoá
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => {
                    setSuccessMessage("");
                }}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSuccessMessage("")}
                    severity="success"
                    variant="filled" //
                    sx={{ width: "100%", fontWeight: "bold" }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={4000}
                onClose={() => setErrorMessage("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setErrorMessage("")}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%", fontWeight: "bold" }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
}
