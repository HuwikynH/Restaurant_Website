import React, { useState } from "react";
import "./UserProfile.css";

function UserProfile() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [username, setUsername] = useState(user?.username || "");
    const [email] = useState(user?.email || "");
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSaveChanges = async () => {
        setLoading(true);
        setMessage("");
        setError("");

        // Validate input
        if (!username.trim()) {
            setError("Tên người dùng không được để trống");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: username.trim(),
                    oldPassword: showPasswordForm ? oldPassword : undefined,
                    newPassword: showPasswordForm ? newPassword : undefined,
                    confirmPassword: showPasswordForm ? confirmPassword : undefined,
                }),
            });

            const data = await res.json();
            console.log("Response từ server:", data);

            if (!res.ok) {
                setError(data.msg || "Có lỗi xảy ra!");
            } else {
                setMessage("Cập nhật thành công!");
                // Cập nhật lại localStorage
                const updatedUser = { ...user, username: username.trim() };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Reset form mật khẩu nếu đã cập nhật thành công
                if (showPasswordForm) {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowPasswordForm(false);
                }
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật:", err);
            setError("Lỗi kết nối server, vui lòng thử lại sau.");
        }
        setLoading(false);
    };

    const handlePasswordChange = () => {
        setShowPasswordForm(!showPasswordForm);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setMessage("");
    };

    return (
        <div className="user-profile-container">
            <div className="profile-header">
                <h1>Thông tin cá nhân</h1>
            </div>
            <div className="profile-content">
                <div className="info-section">
                    <div className="form-group">
                        <label>Tên người dùng</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên người dùng"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} disabled />
                    </div>

                    {!showPasswordForm ? (
                        <button className="change-password-btn" onClick={handlePasswordChange}>
                            Đổi mật khẩu
                        </button>
                    ) : (
                        <div className="password-form">
                            <div className="form-group">
                                <label>Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu cũ"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nhập lại mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                            <button className="cancel-password-btn" onClick={handlePasswordChange}>
                                Hủy
                            </button>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

                    <button
                        className="save-changes-btn"
                        onClick={handleSaveChanges}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
