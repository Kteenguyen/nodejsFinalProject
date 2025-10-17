const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Tạo một transporter (dịch vụ sẽ gửi email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Định nghĩa các tùy chọn cho email
    const mailOptions = {
        from: `Your Shop Name <${process.env.EMAIL_USER}>`, // Tên người gửi
        to: options.to,
        subject: options.subject,
        html: options.html,
        // text: options.text // có thể dùng text thay cho html
    };

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;