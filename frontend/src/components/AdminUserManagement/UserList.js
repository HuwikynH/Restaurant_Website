import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Box,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    VpnKey as ResetPasswordIcon,
    Add as AddIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import "./UserList.css"; // Import file CSS

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "user",
    });
    const [createFormData, setCreateFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
    });
    const [userPassword, setUserPassword] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // State cho thanh tìm kiếm

    // Lấy danh sách người dùng
    const fetchUsers = async (email = "") => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("Không tìm thấy token, vui lòng đăng nhập lại để xem danh sách người dùng.");
                return;
            }

            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/users/admin/users?email=${email}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers(response.data);
        } catch (error) {
            if (error?.response?.status === 401) {
                console.warn("Token không hợp lệ hoặc đã hết hạn, vui lòng đăng xuất và đăng nhập lại.");
            } else {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Xử lý tìm kiếm
    const handleSearch = () => {
        fetchUsers(searchTerm);
    };

    // Xử lý mở dialog chỉnh sửa
    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
        });
        setOpenDialog(true);
    };

    // Xử lý xóa người dùng
    const handleDelete = async (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/users/admin/users/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                fetchUsers();
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
            }
        }
    };

    // Xử lý cập nhật thông tin người dùng
    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/users/admin/users/${selectedUser._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOpenDialog(false);
            fetchUsers();
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
        }
    };

    // Xử lý tạo tài khoản mới
    const handleCreate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/users/admin/users`,
                createFormData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOpenCreateDialog(false);
            setCreateFormData({
                username: "",
                email: "",
                password: "",
                role: "user",
            });
            fetchUsers();
        } catch (error) {
            console.error("Lỗi khi tạo tài khoản:", error);
        }
    };

    // Xử lý đặt lại mật khẩu
    const handleResetPassword = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn đặt lại mật khẩu người dùng này về "remy"?')) {
            try {
                const token = localStorage.getItem("token");
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/users/admin/users/${userId}/reset-password`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                alert('Mật khẩu đã được đặt lại thành công về "remy".');
            } catch (error) {
                console.error("Lỗi khi đặt lại mật khẩu:", error);
                alert("Đã xảy ra lỗi khi đặt lại mật khẩu.");
            }
        }
    };

    return (
        <div>
            <Box className="user-list-header">
                <Typography variant="h5" component="h2">
                    Quản lý tài khoản
                </Typography>
                <Box className="user-list-actions">
                    <TextField
                        label="Tìm theo Email"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-field"
                    />
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        className="search-button"
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenCreateDialog(true)}
                        className="create-button"
                    >
                        Tạo tài khoản mới
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead className="styled-table-head">
                        <TableRow>
                            <TableCell className="styled-table-head th">Tên người dùng</TableCell>
                            <TableCell className="styled-table-head th">Email</TableCell>
                            <TableCell className="styled-table-head th">Vai trò</TableCell>
                            <TableCell className="styled-table-head th">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} className="styled-table-row">
                                <TableCell
                                    style={{
                                        color:
                                            user.provider === "facebook"
                                                ? "#3b5998"
                                                : user.provider === "google"
                                                ? "#dd4b39"
                                                : "inherit",
                                    }}
                                >
                                    {/* Hiển thị tên và icon social nếu có */}
                                    {user.username || user.name} {/* Hiển thị username hoặc name */}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    {/* Hiển thị icon social giữa nút chỉnh sửa và xóa */}
                                    {user.provider === "facebook" && (
                                        <i className="bx bxl-facebook-square social-icon facebook"></i>
                                    )}
                                    {user.provider === "google" && (
                                        <i className="bx bxl-google-plus social-icon google"></i>
                                    )}
                                    {/* Chỉ hiển thị nút reset mật khẩu cho người dùng local */}
                                    {(!user.provider || user.provider === "local") && (
                                        <IconButton onClick={() => handleResetPassword(user._id)}>
                                            <ResetPasswordIcon />
                                        </IconButton>
                                    )}
                                    <IconButton onClick={() => handleDelete(user._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog chỉnh sửa thông tin */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Tên người dùng"
                        fullWidth
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        InputProps={{ readOnly: true }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Vai trò</InputLabel>
                        <Select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <MenuItem value="user">Người dùng</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        className="create-button" // Sử dụng class name tương tự cho nút Update
                    >
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog tạo tài khoản mới */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Tạo tài khoản mới</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Tên người dùng"
                        fullWidth
                        value={createFormData.username}
                        onChange={(e) =>
                            setCreateFormData({ ...createFormData, username: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={createFormData.email}
                        onChange={(e) =>
                            setCreateFormData({ ...createFormData, email: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Mật khẩu"
                        type="password"
                        fullWidth
                        value={createFormData.password}
                        onChange={(e) =>
                            setCreateFormData({ ...createFormData, password: e.target.value })
                        }
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Vai trò</InputLabel>
                        <Select
                            value={createFormData.role}
                            onChange={(e) =>
                                setCreateFormData({ ...createFormData, role: e.target.value })
                            }
                        >
                            <MenuItem value="user">Người dùng</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
                    <Button onClick={handleCreate} variant="contained" className="create-button">
                        Tạo tài khoản
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xem mật khẩu (Không sử dụng) */}
            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
                <DialogTitle>Mật khẩu người dùng</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Mật khẩu đã được mã hóa: {userPassword}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserList;
