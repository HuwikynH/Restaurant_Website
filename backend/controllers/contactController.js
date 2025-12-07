const asyncHandler = require("express-async-handler");
const Contact = require("../models/Contact");
const {
  sendVerificationEmail,
  sendContactNotificationEmail,
  sendContactConfirmationEmail,
} = require("../services/emailService");
const rateLimit = require("express-rate-limit");

// Tạo rate limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 request mỗi IP trong 15 phút
  message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút",
  standardHeaders: true,
  legacyHeaders: false,
});

// Hàm kiểm tra email hợp lệ
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Create new contact message
// @route   POST /api/contact
// @access  Public
const createContactMessage = asyncHandler(async (req, res) => {
  console.log("Received contact form submission:", req.body);
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error("Vui lòng điền đầy đủ thông tin");
  }

  // Kiểm tra định dạng email
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Email không hợp lệ");
  }

  const contactMessage = new Contact({
    name,
    email,
    subject,
    message,
  });

  try {
    const createdContactMessage = await contactMessage.save();
    console.log("Contact message saved successfully:", createdContactMessage);

    // Gửi email thông báo cho admin
    try {
      await sendContactNotificationEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "Tin nhắn liên hệ mới",
        name,
        email,
        messageSubject: subject,
        message,
      });
      console.log("Admin notification email sent successfully");
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
      // Không throw lỗi ở đây để không ảnh hưởng đến trải nghiệm người dùng
    }

    // Gửi email xác nhận cho người dùng
    try {
      await sendContactConfirmationEmail({
        to: email,
        name,
      });
      console.log("User confirmation email sent successfully");
    } catch (emailError) {
      console.error("Error sending user confirmation email:", emailError);
      // Không throw lỗi ở đây để không ảnh hưởng đến trải nghiệm người dùng
    }

    res.status(201).json({
      success: true,
      message: "Tin nhắn đã được gửi thành công",
      data: createdContactMessage,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi tin nhắn",
      error: error.message,
    });
  }
});

module.exports = {
  createContactMessage,
  contactLimiter,
};
