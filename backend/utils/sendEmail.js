// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log("--- CHẾ ĐỘ GỬI EMAIL  ---");

    // 1. Tạo tài khoản test ngẫu nhiên (Không cần đăng ký)
    // let testAccount = await nodemailer.createTestAccount();

    // 2. Tạo Transporter giả lập
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER, // User tự sinh
            pass: process.env.EMAIL_PASS, // Pass tự sinh
        },
    });

    // 3. Cấu hình email
    const mailOptions = {
        from: '"PhoneWorld Support" <support@phoneworld.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 4. Gửi mail
    let info = await transporter.sendMail(mailOptions);

    console.log("✅ Đã gửi mail (giả lập) thành công!");
    // 👇👇👇 QUAN TRỌNG: Bấm vào link này để xem nội dung mail reset password
    console.log("🔗 XEM EMAIL TẠI ĐÂY (Preview URL): %s", nodemailer.getTestMessageUrl(info));
    console.log("---------------------------------------");
};

module.exports = sendEmail;