const nodemailer = require("nodemailer");

// Sử dụng cấu hình SMTP chuẩn cho Gmail để chạy ổn định trên cloud
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // dùng STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // tránh lỗi chứng chỉ tự ký trên một số môi trường cloud
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = async (email, token) => {
  console.log("[Email] Đang gửi email xác thực tới", email);
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const url = `${baseUrl}/api/users/verify-email?token=${token}`;

  console.log("[Email] URL xác thực:", url);
  console.log("[Email] Đang gửi email xác thực tới", email, "với URL:", url);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác thực Email của bạn",
    html: `<p>Vui lòng nhấp vào liên kết sau để xác thực email của bạn: <a href="${url}">${url}</a></p>`,
  });

  console.log("[Email] Đã gửi email xác thực tới", email);
};

const sendContactNotificationEmail = async ({
  to,
  subject,
  name,
  email,
  messageSubject,
  message,
}) => {
  const html = `
    <h2>Tin nhắn liên hệ mới</h2>
    <p><strong>Người gửi:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Tiêu đề:</strong> ${messageSubject}</p>
    <p><strong>Nội dung:</strong></p>
    <p>${message}</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

const sendContactConfirmationEmail = async ({ to, name }) => {
  const html = `
    <h2>Xin chào ${name},</h2>
    <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
    <p>Trân trọng,<br>Đội ngũ Ratatouille</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Xác nhận tin nhắn liên hệ - Ratatouille",
    html,
  });
};

const sendNewPasswordEmail = async (email, newPassword) => {
  const html = `<p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p><p>Vui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập thành công.</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mật khẩu mới cho tài khoản Ratatouille",
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendContactNotificationEmail,
  sendContactConfirmationEmail,
  sendNewPasswordEmail,
};
