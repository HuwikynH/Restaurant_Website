import React, { useEffect, useState } from "react";
import "./LoginPopup.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPopup({ setShowLogin }) {
  const navigate = useNavigate();
  const [currState, setCurrState] = useState("Đăng nhập");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.msg || "Đăng ký thất bại");
        setLoading(false);
        return;
      }
      toast.success(
        data.msg || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
      );
      setCurrState("Đăng nhập");
      resetForm();
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      toast.error("Lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.msg || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }
      if (data.user && !data.user.isVerified && data.user.role !== "admin") {
        toast.error(
          "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email của bạn để xác thực."
        );
        setLoading(false);
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setShowLogin(false);
      toast.success("Đăng nhập thành công!");
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Lỗi kết nối server, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Vui lòng nhập email để lấy lại mật khẩu");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.msg || "Không thể gửi lại mật khẩu");
        setForgotLoading(false);
        return;
      }
      toast.success(data.msg || "Mật khẩu mới đã được gửi tới email của bạn!");
      setCurrState("Đăng nhập");
      setForgotEmail("");
    } catch (error) {
      toast.error("Lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleStateChange = (newState) => {
    setCurrState(newState);
    resetForm();
  };

  const renderFormInputs = () => {
    if (currState === "Quên mật khẩu") {
      return (
        <div className="login-popup-inputs">
          <input
            type="email"
            name="forgotEmail"
            placeholder="Nhập email của bạn"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
        </div>
      );
    }
    if (currState === "Đăng kí") {
      return (
        <div className="login-popup-inputs">
          <input
            type="text"
            name="username"
            placeholder="Tên của bạn"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#888",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="login-popup-inputs">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{ width: "100%" }}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#888",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="login-popup">
      {(loading || forgotLoading) && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <ToastContainer position="top-center" autoClose={3000} />
      <form
        className="login-popup-container"
        onSubmit={
          currState === "Đăng nhập"
            ? handleSubmit
            : currState === "Đăng kí"
            ? handleRegister
            : handleForgotPassword
        }
      >
        <div>
          <span></span>
          <i
            onClick={() => setShowLogin(false)}
            className="close-icon bx bx-x"
          ></i>
        </div>

        <div className="login-popup-title">
          <h2>{currState}</h2>
          <p>
            {currState === "Đăng nhập"
              ? "Khám phá hàng ngàn công thức, lưu lại món ăn yêu thích và chia sẻ trải nghiệm của bạn!"
              : currState === "Đăng kí"
              ? "Tham gia ngay để lưu công thức, viết đánh giá và kết nối với những người yêu ẩm thực!"
              : "Nhập email để nhận mật khẩu mới qua email của bạn."}
          </p>
        </div>

        {renderFormInputs()}

        <button type="submit">
          {currState === "Đăng kí"
            ? "Tạo tài khoản"
            : currState === "Quên mật khẩu"
            ? "Gửi lại mật khẩu"
            : "Đăng nhập"}
        </button>

        {currState === "Đăng kí" && (
          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>Tôi đồng ý với Điều khoản sử dụng & Chính sách quyền riêng tư</p>
          </div>
        )}

        {currState !== "Quên mật khẩu" && (
          <div
            style={{
              textAlign: "right",
              marginTop: "-10px",
              marginBottom: "10px",
            }}
          >
            {currState === "Đăng nhập" && (
              <span
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={() => setCurrState("Quên mật khẩu")}
              >
                Quên mật khẩu?
              </span>
            )}
          </div>
        )}

        {/* Social Login Buttons */}
        {currState !== "Quên mật khẩu" && (
          <div className="social-login-buttons">
            <a href={`${process.env.REACT_APP_API_URL}/auth/facebook`}>
              <button type="button">Đăng nhập bằng Facebook</button>
            </a>
            <a href={`${process.env.REACT_APP_API_URL}/auth/google`}>
              <button type="button">Đăng nhập bằng Google</button>
            </a>
          </div>
        )}

        <div className="auth-switch">
          {currState === "Đăng nhập" ? (
            <p>
              Tạo tài khoản?
              <span onClick={() => handleStateChange("Đăng kí")}>Đăng kí</span>
            </p>
          ) : currState === "Đăng kí" ? (
            <p>
              Đã có tài khoản?
              <span onClick={() => handleStateChange("Đăng nhập")}>
                Đăng nhập
              </span>
            </p>
          ) : (
            <p>
              Quay lại?
              <span onClick={() => handleStateChange("Đăng nhập")}>
                Đăng nhập
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginPopup;
