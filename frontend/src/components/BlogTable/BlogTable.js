import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Tooltip, IconButton, Button, Paper } from "@mui/material";
import { viVN } from "@mui/x-data-grid/locales";
import CloseIcon from "@mui/icons-material/Close";
import BlogInfoAdmin from "./BlogInfoAdmin";
import BlogEditAdmin from "./BlogEditAdmin";
import BlogAddAdmin from "./BlogAddAdmin";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./BlogTable.css";
import { useNavigate } from "react-router-dom";

const paginationModel = { page: 0, pageSize: 10 };

export default function BlogTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [blogToDeleteId, setBlogToDeleteId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const formatted = res.data.blogs.map((item) => ({
                id: item._id,
                image: item.image,
                title: item.title,
                summary: item.summary,
                author: item.author,
                content: item.content,
                createdAt: item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "",
                updatedAt: item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString("vi-VN")
                    : "",
                rawCreatedAt: item.createdAt,
                _raw: item,
            }));
            setRows(formatted);
        } catch (err) {
            setErrorMessage("Lỗi khi tải blog!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleViewBlog = (id) => {
        const blog = rows.find((r) => r.id === id);
        setSelectedBlog(blog ? { ...blog._raw } : null);
        setOpenDialog(true);
    };
    const handleEditBlog = (id) => {
        const blog = rows.find((r) => r.id === id);
        setSelectedBlog(blog ? { ...blog._raw } : null);
        setOpenEdit(true);
    };
    const handleDeleteBlog = (id) => {
        setBlogToDeleteId(id);
        setDeleteConfirmOpen(true);
    };
    const confirmDeleteBlog = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/blogs/${blogToDeleteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMessage("Xoá blog thành công");
            fetchBlogs();
        } catch (err) {
            setErrorMessage("Không thể xoá blog!");
        } finally {
            setDeleteConfirmOpen(false);
            setBlogToDeleteId(null);
        }
    };
    const handleGoToBlog = (id) => {
        navigate(`/blogs/${id}`);
    };

    const columns = [
        {
            field: "image",
            headerName: "Ảnh",
            width: 90,
            renderCell: (params) => (
                <img
                    src={params.row.image}
                    alt=""
                    style={{ width: 60, height: 40, objectFit: "cover" }}
                />
            ),
        },
        { field: "title", headerName: "Tiêu đề", width: 200 },
        { field: "author", headerName: "Tác giả", width: 140 },
        {
            field: "content",
            headerName: "Nội dung",
            width: 300,
            renderCell: (params) => (
                <span>
                    {params.row.content.length > 60
                        ? params.row.content.slice(0, 60) + "..."
                        : params.row.content}
                </span>
            ),
        },
        {
            field: "createdAt",
            headerName: "Ngày tạo",
            width: 120,
        },
        {
            field: "updatedAt",
            headerName: "Ngày cập nhập",
            width: 120,
        },
        { field: "summary", headerName: "Tóm tắt", width: 220 },
        {
            field: "actions",
            headerName: "Hành động",
            width: 180,
            renderCell: (params) => (
                <div style={{ display: "flex", gap: 12 }}>
                    <Tooltip title="Đi đến" placement="top">
                        <i
                            className="bx bx-link-external"
                            style={{ cursor: "pointer", fontSize: 24 }}
                            onClick={() => handleGoToBlog(params.row.id)}
                        ></i>
                    </Tooltip>
                    <Tooltip title="Xem" placement="top">
                        <i
                            className="bx bx-show"
                            style={{ cursor: "pointer", fontSize: 24 }}
                            onClick={() => handleViewBlog(params.row.id)}
                        ></i>
                    </Tooltip>
                    <Tooltip title="Sửa" placement="top">
                        <i
                            className="bx bx-edit"
                            style={{ cursor: "pointer", fontSize: 24 }}
                            onClick={() => handleEditBlog(params.row.id)}
                        ></i>
                    </Tooltip>
                    <Tooltip title="Xóa" placement="top">
                        <i
                            className="bx bx-trash"
                            style={{ cursor: "pointer", fontSize: 24 }}
                            onClick={() => handleDeleteBlog(params.row.id)}
                        ></i>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="blog-table-wrapper">
            <Paper className="table-wrapper" sx={{ maxHeight: "80vh", width: "90%" }}>
                <Box className="table-toolbar">
                    <Typography className="table-title">Danh sách blog</Typography>
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
                    loading={loading}
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
                        footerRowSelected: (count) =>
                            count === 1 ? "Đã chọn 1 dòng" : `Đã chọn ${count} dòng`,
                        footerPaginationLabelRowsPerPage: "Số dòng mỗi trang",
                        footerPaginationLabelDisplayedRows: ({ from, to, count }) =>
                            `${from}–${to} trong ${count}`,
                    }}
                />
                {/* Xem chi tiết blog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <IconButton
                            onClick={() => setOpenDialog(false)}
                            style={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <BlogInfoAdmin blog={selectedBlog} />
                    </DialogContent>
                </Dialog>
                {/* Sửa blog */}
                <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <IconButton
                            onClick={() => setOpenEdit(false)}
                            style={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <BlogEditAdmin
                            blog={selectedBlog}
                            onClose={() => setOpenEdit(false)}
                            onUpdated={fetchBlogs}
                        />
                    </DialogContent>
                </Dialog>
                {/* Thêm blog */}
                <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <IconButton
                            onClick={() => setOpenAdd(false)}
                            style={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <BlogAddAdmin onClose={() => setOpenAdd(false)} onAdded={fetchBlogs} />
                    </DialogContent>
                </Dialog>
                {/* Xác nhận xoá */}
                <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle>Xác nhận xoá</DialogTitle>
                    <DialogContent>Bạn có chắc chắn muốn xoá blog này không?</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                            Huỷ
                        </Button>
                        <Button
                            onClick={confirmDeleteBlog}
                            color="error"
                            variant="contained"
                            sx={{
                                backgroundColor: "#222",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#4a4a48" },
                            }}
                        >
                            Xoá
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Thông báo */}
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={3000}
                    onClose={() => setSuccessMessage("")}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSuccessMessage("")}
                        severity="success"
                        variant="filled"
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
        </div>
    );
}
