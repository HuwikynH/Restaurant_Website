import React, { useState } from "react";
import "./ContactForm.css";
import axios from "axios";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/contact`,
                formData
            );

            if (response.data.success) {
                setSuccess(true);
                setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                });
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="contact-form-container">
            <h2>Gửi Tin Nhắn Cho Chúng Tôi</h2>
            {success && (
                <div className="success-message">
                    Cảm ơn bạn đã gửi tin nhắn. Chúng tôi sẽ phản hồi sớm nhất có thể!
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Họ và tên</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ và tên của bạn"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Nhập địa chỉ email của bạn"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">Tiêu đề</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Nhập tiêu đề tin nhắn"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message">Nội dung tin nhắn</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Nhập nội dung tin nhắn của bạn"
                        rows="5"
                        disabled={isLoading}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className={`submit-button ${isLoading ? "loading" : ""}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading-spinner"></span>
                            Đang gửi...
                        </>
                    ) : (
                        "Gửi tin nhắn"
                    )}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
