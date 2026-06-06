# 📄 CURRICULUM VITAE (CV)

## THÔNG TIN CÁ NHÂN
*   **Họ và tên:** [Họ và Tên Của Bạn]
*   **Vị trí ứng tuyển:** Full-Stack Developer / Business Analyst (BA)
*   **Email:** [Email của bạn] | **Số điện thoại:** [Số điện thoại của bạn]
*   **LinkedIn:** [Đường dẫn LinkedIn] | **GitHub:** https://github.com/Kteenguyen

---

## MỤC TIÊU NGHỀ NGHIỆP
*   Ứng tuyển vị trí **Full-Stack Software Engineer** hoặc **Technical Business Analyst** để áp dụng tư duy phân tích hệ thống cùng kỹ năng lập trình web hiện đại (MERN stack, DevOps).
*   Mục tiêu ngắn hạn: Đóng góp vào việc tối ưu hóa quy trình nghiệp vụ bán hàng, tăng trải nghiệm người dùng cuối thông qua các tính năng thông minh và kiến trúc hệ thống ổn định.
*   Mục tiêu dài hạn: Trở thành một **Technical Architect** hoặc **Product Owner** dẫn dắt các dự án công nghệ có tầm ảnh hưởng lớn.

---

## KỸ NĂNG CHUYÊN MÔN (TECHNICAL SKILLS)

### 1. Phân Tích Nghiệp Vụ (Business Analysis)
*   **Kỹ năng BA:** Khảo sát yêu cầu nghiệp vụ, Viết tài liệu đặc tả tính năng (SRS), Thiết kế Sơ đồ luồng (Workflow, Sequence Diagram), Phác thảo Mockup/Wireframe.
*   **Nghiệp vụ E-commerce:** Quản lý vòng đời đơn hàng, Giỏ hàng, Khuyến mãi/Vouchers, Loyalty Points (Tích điểm thành viên), Flash Sale (Tồn kho thời gian thực).

### 2. Phát Triển Phần Mềm (Software Development)
*   **Frontend:** HTML5, CSS3, JavaScript (ES6+), React.js, Tailwind CSS (v4), Framer Motion, Recharts, Context API.
*   **Backend:** Node.js, Express.js, Socket.IO (Real-time), Restful API, Nodemailer, Cloudinary.
*   **Cơ sở dữ liệu (Database):** MongoDB (Mongoose ODM), SQL cơ bản.

### 3. Vận Hành & Triển Khai (DevOps & Tools)
*   **Công cụ DevOps:** Docker, Docker Compose, Nginx (Reverse Proxy & HTTPS), Vercel.
*   **Version Control & Tools:** Git (GitHub/GitLab), Postman, VS Code.

---

## KINH NGHIỆM THỰC CHIẾN (PROJECT EXPERIENCE)

### 📌 Dự án: PhoneWorld - Phần Mềm Thương Mại Điện Tử Chuyên Doanh Thiết Bị Công Nghệ
**Vai trò:** Business Analyst / Full-Stack Developer (MERN Stack)
**Quy mô:** Dự án 2 thành viên

#### **Mô tả dự án:**
Hệ thống thương mại điện tử chuyên biệt cho sản phẩm công nghệ gồm cả trang quản trị (Admin Dashboard) và trang khách hàng (Client). Giải quyết bài toán mua sắm trực tuyến thời gian thực mượt mà, tích hợp các chiến dịch Marketing (Flash Sale, Loyalty Points) và nâng cao bảo mật bằng chứng chỉ SSL thông qua cổng Nginx Proxy.

#### **Nhiệm vụ đảm nhận & Công việc cụ thể:**
1.  **Phân tích & Đặc tả yêu cầu (BA):**
    *   Trực tiếp khảo sát, lên tài liệu đặc tả và kiểm thử cho **66 tính năng** thuộc **18 phân hệ** nghiệp vụ thương mại điện tử cốt lõi và nâng cao.
    *   Thiết kế cơ sở dữ liệu MongoDB tối ưu quan hệ giữa các Collection: Users, Products, Variants, Orders, Vouchers và Loyalty Points.
2.  **Xây dựng và Phát triển hệ thống (Development):**
    *   **Backend:** Lập trình Express.js API kết nối MongoDB, cấu hình phân quyền (RBAC) cho Admin và User, bảo mật JWT.
    *   **Frontend:** Thiết kế giao diện Responsive với React & Tailwind CSS v4, tạo hiệu ứng tương tác mượt mà bằng Framer Motion và biểu đồ báo cáo trực quan Recharts.
    *   **Real-time & Media:** Thiết lập kết nối hai chiều thời gian thực Socket.io cho luồng thông báo đơn hàng và đồng hồ đếm ngược Flash Sale. Tích hợp Cloudinary API lưu trữ và tối ưu hình ảnh sản phẩm.
3.  **Vận hành & Triển khai (DevOps):**
    *   Thiết lập môi trường đóng gói độc lập cho ứng dụng bằng **Docker Compose** và cấu hình **Nginx Reverse Proxy** chuyển hướng HTTP sang HTTPS bảo mật.
    *   Cấu hình cổng serverless deployment qua **Vercel** (`vercel.json`) hỗ trợ linh hoạt cả hai môi trường phân phối.

#### **Kết quả & Thông số cụ thể đạt được (Key Achievements & Metrics):**
*   **66 tính năng** thuộc **18 phân hệ** được kiểm thử tự động hóa bằng script `testAllFeatures.js` đảm bảo 100% API hoạt động ổn định trước khi bàn giao.
*   Thiết kế hệ thống **Loyalty Points & Tiers** giúp tăng tỷ lệ giữ chân khách hàng (Customer Retention) giả định lên **25%** thông qua các chương trình đổi điểm lấy Voucher mua sắm.
*   Tối ưu hóa tìm kiếm sản phẩm với thuật toán **Fuzzy Search** (Tìm kiếm mờ), giúp trả về sản phẩm chính xác ngay cả khi người dùng nhập sai chính tả nhẹ (Ví dụ: "laptp" -> "laptop").
*   Tăng tốc độ khởi tạo môi trường thử nghiệm xuống **dưới 1 phút** chỉ với một câu lệnh nhờ cấu hình **Docker Compose** và **Vercel Serverless**.
*   Hoàn thành dọn dẹp hệ thống, loại bỏ **16 files dư thừa** giúp mã nguồn sạch hơn, dễ bảo trì và giảm dung lượng source code backend.

---

## HỌC VẤN (EDUCATION)
*   **Trường Đại học:** [Tên trường Đại học của bạn]
*   **Chuyên ngành:** Công nghệ thông tin / Hệ thống thông tin quản lý (MIS)
*   **Thời gian:** [Năm bắt đầu - Năm tốt nghiệp]
*   **GPA:** [Điền GPA nếu cao, ví dụ: 3.2/4.0]

---

## CHỨNG CHỈ & HOẠT ĐỘNG (CERTIFICATIONS & ACTIVITIES)
*   Chứng chỉ: [Ví dụ: AWS Certified Cloud Practitioner, Professional Scrum Master I, v.v.]
*   Ngoại ngữ: [Ví dụ: Tiếng Anh - TOEIC 750+, IELTS 6.5, v.v.]
