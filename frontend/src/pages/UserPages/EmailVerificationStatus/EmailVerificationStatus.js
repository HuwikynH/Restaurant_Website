import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EmailVerificationStatus.css"; // Import CSS file for styling

function EmailVerificationStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Đang xác thực email của bạn...");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");
        const status = queryParams.get("status"); // Thêm để nhận trạng thái từ backend

        if (status) {
            // Nếu trạng thái được gửi từ backend, hiển thị trực tiếp
            if (status === "success") {
                setMessage("Email của bạn đã được xác thực thành công!");
                setIsSuccess(true);
            } else {
                setMessage("Xác thực email thất bại. Token không hợp lệ hoặc đã hết hạn.");
                setIsSuccess(false);
            }
            setLoading(false);
        } else if (token) {
            // Nếu là lần đầu truy cập với token, gọi API xác thực
            const verifyEmail = async () => {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/users/verify-email?token=${token}`
                    );
                    const data = await response.json();

                    if (response.ok) {
                        setMessage("Email của bạn đã được xác thực thành công!");
                        setIsSuccess(true);
                    } else {
                        setMessage(data.msg || "Xác thực email thất bại.");
                        setIsSuccess(false);
                    }
                } catch (error) {
                    console.error("Lỗi khi xác thực email:", error);
                    setMessage("Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.");
                    setIsSuccess(false);
                } finally {
                    setLoading(false);
                }
            };
            verifyEmail();
        } else {
            // Không có token hoặc trạng thái
            setMessage("Liên kết xác thực không hợp lệ.");
            setIsSuccess(false);
            setLoading(false);
        }
    }, [location.search]);

    const handleGoToLogin = () => {
        navigate("/"); // Chuyển về trang chủ hoặc trang đăng nhập
        // Cần một cơ chế để mở popup đăng nhập nếu bạn muốn
        // Hiện tại, tạm thời chuyển về trang chủ
    };

    return (
        <div className="email-verification-container">
            <div className={`verification-box ${isSuccess ? "success" : "error"}`}>
                {loading ? (
                    <p className="loading-message">{message}</p>
                ) : (
                    <>
                        <h2>{isSuccess ? "Xác thực thành công!" : "Xác thực thất bại!"}</h2>
                        <p>{message}</p>
                        <button onClick={handleGoToLogin} className="go-to-login-button">
                            Quay lại trang chủ
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default EmailVerificationStatus;
