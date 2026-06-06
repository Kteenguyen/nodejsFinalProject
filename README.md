# 🎯 PHẦN MỀM THƯƠNG MẠI ĐIỆN TỬ - PHONEWORLD

Hệ thống Thương mại Điện tử chuyên doanh Điện thoại & Thiết bị công nghệ hoàn chỉnh với kiến trúc **MERN Stack** (MongoDB, Express, React, Node.js), kết nối thời gian thực bằng Socket.IO và môi trường container hóa Docker.

---

## 1. Giới Thiệu Dự Án & Vấn Đề Giải Quyết
*   **Tên dự án:** PhoneWorld (E-commerce Platform).
*   **Vấn đề giải quyết:**
    *   Cung cấp một giải pháp mua sắm trực tuyến hiện đại, mượt mà và an toàn cho khách hàng công nghệ.
    *   Tối ưu hóa quy trình quản lý bán hàng của Admin từ quản lý sản phẩm, biến thể (Variants), tồn kho đến doanh thu thông qua Dashboard trực quan.
    *   Giải quyết bài toán giữ chân khách hàng bằng hệ thống điểm thưởng thành viên (**Loyalty Points**) và kích cầu mua sắm bằng các chiến dịch **Flash Sale** thời gian thực.
    *   Tối ưu hóa khả năng tìm kiếm sản phẩm cho người dùng bằng thuật toán tìm kiếm mờ (**Fuzzy Search**).

---

## 2. Công Nghệ Sử Dụng (Tech Stack)

### Backend
*   **Ngôn ngữ:** JavaScript (Node.js v20+)
*   **Framework:** Express.js
*   **Cơ sở dữ liệu:** MongoDB với Mongoose ODM
*   **Thời gian thực (Real-time):** Socket.io
*   **Bảo mật & Xác thực:** JSON Web Token (JWT), Bcrypt.js, Google OAuth, Facebook OAuth
*   **Lưu trữ Media:** Cloudinary API thông qua Multer-storage-cloudinary
*   **Dịch vụ Email:** Nodemailer (Gửi mã OTP, xác nhận đơn hàng)

### Frontend
*   **Thư viện chính:** React.js (phiên bản 18+), Vite làm công cụ build
*   **Styling:** Tailwind CSS (phiên bản v4)
*   **Animation:** Framer Motion (hiệu ứng chuyển động mượt mà)
*   **Biểu đồ & Thống kê:** Recharts / Chart.js
*   **Quản lý trạng thái & Route:** React Router DOM (v7), Context API
*   **Các thư viện hỗ trợ:** Lucide React (Icons), Flatpickr (Chọn ngày tháng), React Toastify (Thông báo)

### Bảo mật & Triển khai (DevOps)
*   **Container hóa:** Docker, Docker Compose
*   **Proxy & Web Server:** Nginx (Proxy ngược từ HTTP sang HTTPS)
*   **Giao thức bảo mật:** HTTPS với chứng chỉ SSL self-signed
*   **Kiểm thử tự động:** Script chạy tự động đánh giá các tính năng cốt lõi (`testAllFeatures.js`)

---

## 3. Quy Trình Phát Triển Dự Án (Project Lifecycle)

Quy trình triển khai dự án trải qua 4 giai đoạn chính từ khâu chuẩn bị đến khi hoàn tất:

### Giai đoạn 1: Chuẩn bị & Phân tích Yêu cầu (Preparation & Analysis)
*   **Phân tích Nghiệp vụ (BA):** Khảo sát hành vi người dùng thương mại điện tử, định hình luồng đi của giỏ hàng, đơn hàng, điểm thưởng và Flash Sale.
*   **Đặc tả Tính năng:** Xác định và viết tài liệu mô tả cho 66 tính năng thuộc 18 phân hệ cốt lõi.
*   **Thiết kế Database:** Thiết kế lược đồ dữ liệu (MongoDB Schema) tối ưu cho quan hệ giữa người dùng, sản phẩm (variants), đơn hàng, và hệ thống điểm thưởng.

### Giai đoạn 2: Phát triển Hệ thống (Development)
*   **Xây dựng Backend:** Thiết lập máy chủ Express, cấu hình kết nối MongoDB, phân quyền Router (Admin/User), thiết lập Socket.io cho thông báo thời gian thực và xây dựng các API xử lý nghiệp vụ bán hàng. Tích hợp Cloudinary để upload ảnh.
*   **Phát triển Frontend:** Thiết kế giao diện responsive thân thiện với người dùng bằng React và Tailwind CSS. Xây dựng các trang Profile, Giỏ hàng, Cửa hàng, Flash Sale, trang Thanh toán, và trang quản trị Admin Dashboard trực quan.

### Giai đoạn 3: Kiểm thử & Sửa lỗi (Testing & Debugging)
*   **Kiểm thử Tự động:** Viết script kiểm thử tự động `testAllFeatures.js` để kiểm tra tính toàn vẹn của API (đăng ký/đăng nhập, thêm giỏ hàng, đặt hàng, cập nhật điểm loyalty).
*   **Kiểm thử Thủ công:** Thử nghiệm chi tiết tính năng chặn tài khoản vi phạm (Ban Account) hiển thị thông báo tiếng Việt, kiểm thử luồng thanh toán COD/Online và kiểm tra hiển thị đồng hồ đếm ngược của Flash Sale.

### Giai đoạn 4: Dọn dẹp & Triển khai (Cleanup & Deployment)
*   **Dọn dẹp mã nguồn:** Xóa bỏ 16 file script test và seed dữ liệu cũ không dùng tới để tối ưu dung lượng source code.
*   **Đóng gói container:** Cấu hình Dockerfile và Docker Compose để chạy ứng dụng độc lập trên mọi môi trường.
*   **Cấu hình Nginx Proxy:** Thiết lập Nginx làm cổng trung gian điều phối request từ HTTP sang HTTPS bảo mật.

---

## 4. Chức Năng Nổi Bật (Key Features)
1.  **Flash Sale Real-time:** Đồng hồ đếm ngược thời gian thực, khóa số lượng mua tối đa cho mỗi user, tự động cập nhật tồn kho tức thời thông qua Socket.IO.
2.  **Loyalty Points & Membership Tiers:** Tích lũy điểm tự động khi mua hàng thành công. Phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) mang lại đặc quyền giảm giá và cho phép đổi điểm thưởng lấy Voucher mua hàng.
3.  **Hệ thống Chặn Tài khoản (Ban Account):** Admin có thể khóa tài khoản vi phạm trực tiếp trên giao diện quản trị. Khi user bị chặn đăng nhập, hệ thống sẽ trả về thông báo lỗi tiếng Việt thân thiện.
4.  **Tìm kiếm Mờ (Fuzzy Search):** Giúp người dùng dễ dàng tìm thấy sản phẩm ngay cả khi gõ sai lỗi chính tả nhẹ (Ví dụ: "laptp" -> "laptop").
5.  **Admin Dashboard Trực quan:** Hiển thị biểu đồ doanh thu theo thời gian thực, cảnh báo sản phẩm sắp hết hàng, danh sách đơn hàng mới và thống kê top sản phẩm bán chạy.

---

## 5. Kết Quả Đầu Ras Của Dự Án (Project Deliverables)
*   **Mã nguồn hoàn chỉnh:** Cấu trúc dự án phân tách rõ ràng giữa frontend và backend, sẵn sàng mở rộng.
*   **Môi trường chạy Docker Compose:** Hệ thống chạy ổn định chỉ với một câu lệnh khởi chạy, đóng gói đầy đủ backend, frontend, và DB.
*   **Tài liệu hướng dẫn & Kiểm thử:** Hệ thống tài liệu chi tiết hỗ trợ vận hành và script test tự động hóa toàn bộ luồng nghiệp vụ.
