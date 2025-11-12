// frontend/src/pages/Auth/Register.jsx
import { AuthController } from "../controllers/AuthController";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// === 1. NHẬN PROPS MỚI (onSuccess, onClose, context) ===
// (Nếu context là 'admin', đây là modal. Nếu là rỗng, đây là trang public)
const Register = ({ onSuccess, onClose, context }) => {
    
    // === 2. XÁC ĐỊNH XEM CÓ PHẢI LÀ MODAL KHÔNG ===
    const isModal = context === 'admin';

    // (Giữ nguyên toàn bộ state cũ của bạn)
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        userName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false); // (Thêm state loading)

    // (Giữ nguyên hàm handleChange)
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // (Giữ nguyên hàm handleAvatarChange)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    // === 3. CẬP NHẬT HÀM handleSubmit (Đổi tên từ handleRegister) ===
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // (Bật loading)

        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
            setLoading(false); // (Tắt loading)
            return;
        }

        try {
            // (Giữ nguyên logic FormData của bạn)
            const registerFormData = new FormData();
            for (const key in formData) {
                if (key !== 'confirmPassword') {
                    registerFormData.append(key, formData[key]);
                }
            }
            if (avatarFile) {
                registerFormData.append('avatar', avatarFile);
            }

            const data = await AuthController.register(registerFormData);

            // === XỬ LÝ KHI THÀNH CÔNG (THEO CONTEXT) ===
            if (isModal && onSuccess) {
                // Nếu là MODAL (Admin):
                // (Users.jsx sẽ toast)
                onSuccess(); // Gọi callback của cha (Users.jsx)
            } else {
                // Nếu là TRANG (Public) - Giữ nguyên logic gốc:
                console.log("Response data from backend after register:", data);
                await login(data); // Tự động đăng nhập sau khi đăng ký thành công
                toast.success("Đăng ký thành công! Hãy thêm địa chỉ của bạn.");
                setTimeout(() => {
                    navigate("/register-address");
                }, 2000);
            }
            // ======================================

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false); // (Tắt loading)
        }
    };
    // ===================================


    // === 4. TÁCH RIÊNG FORM (Để tái sử dụng) ===
    // (Đây là toàn bộ nội dung của Cột Phải trong file gốc)
    const RegisterFormContent = () => (
        <>
            {/* (Tiêu đề - Ẩn khi là Modal) */}
            {!isModal && (
                <>
                    <div className="md:hidden absolute top-6 left-6 flex items-center space-x-2">
                        <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                    </div>
                    <div className="max-w-sm w-full mt-24 md:mt-0">
                        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                            Tạo tài khoản
                        </h1>
                        <h3 className="text-gray-600 mb-6">
                            Cùng PhoneWorld kết nối và trải nghiệm dịch vụ tốt nhất!
                        </h3>

                        <div className="flex items-center justify-center mb-6">
                            <hr className="w-1/4 border-gray-300" />
                            <span className="mx-3 text-gray-400 text-sm">Đăng ký bằng email</span>
                            <hr className="w-1/4 border-gray-300" />
                        </div>
                    </div>
                </>
            )}

            {/* (Form - Giữ nguyên 100% file gốc) */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* (Input Tên) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Họ và tên <span className="text-red-500 text-xs">(bắt buộc)</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nhập họ và tên của bạn"
                        value={formData.name}
                        required
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* (Input Email) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Email <span className="text-red-500 text-xs">(bắt buộc)</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Nhập địa chỉ email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* (Input SĐT + Ngày sinh) */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            Số điện thoại <span className="text-gray-500 text-xs">(tùy chọn)</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Tùy chọn"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="w-full sm:w-1/2">
                        <label className="block text-sm font-medium mb-1">
                            Ngày sinh <span className="text-gray-500 text-xs">(Tùy chọn)</span>
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* (Input Tên đăng nhập) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tên đăng nhập <span className="text-red-500 text-xs">(bắt buộc)</span>
                    </label>
                    <input
                        type="text"
                        name="userName"
                        placeholder="Nhập tên đăng nhập"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* (Input Avatar) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Ảnh đại diện <span className="text-gray-500 text-xs">(tùy chọn)</span>
                    </label>
                    <div className="flex items-center gap-4">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar Preview"
                                className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs text-center">
                                Ảnh xem trước
                            </div>
                        )}
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                {/* (Input Mật khẩu) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mật khẩu <span className="text-red-500 text-xs">(bắt buộc)</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-all duration-200 transform hover:scale-110"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <FiEyeOff className="w-5 h-5" />
                            ) : (
                                <FiEye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* (Input Xác nhận Mật khẩu) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Xác nhận mật khẩu <span className="text-red-500 text-xs">(bắt buộc)</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-all duration-200 transform hover:scale-110"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <FiEyeOff className="w-5 h-5" />
                            ) : (
                                <FiEye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* (Nút Submit) */}
                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
                        disabled={loading} // (Dùng state loading)
                    >
                        {/* (Đổi text theo context) */}
                        {loading ? "Đang xử lý..." : (isModal ? "Tạo Người Dùng" : "Đăng ký")}
                    </button>
                </div>
            </form>

            {/* (Link Đăng nhập - Ẩn khi là Modal) */}
            {!isModal && (
                <p className="text-center text-sm text-gray-600 mt-6 pb-10">
                    Đã có tài khoản?{" "}
                    <Link to="/login"
                        className="text-blue-600 inline-block transition-all duration-200 hover:-translate-y-0.5">
                        Đăng nhập ngay
                    </Link>
                </p>
            )}
        </>
    );
    // ===================================

    // === 5. RENDER (Chia 2 trường hợp) ===

    // TRƯỜNG HỢP 1: TRONG MODAL (Admin) - YÊU CẦU CỦA BẠN
    // (Chỉ render form, không render hình, không layout toàn trang)
    if (isModal) {
        return (
            <div className="w-full">
                {/* (Không cần ToastContainer, vì Users.jsx đã có) */}
                <RegisterFormContent />
            </div>
        );
    }

    // TRƯỜNG HỢP 2: TRANG ĐĂNG KÝ (Public) - Giữ nguyên 100% file gốc
    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            {/* LEFT SIDE IMAGE (Ghim cố định) */}
            <div className="hidden md:flex w-1/2 bg-[#f3f5ff] items-center justify-center relative">
                <img
                    src="/img/register-illustration.svg"
                    alt="Register Illustration"
                    className="max-w-md w-4/5"
                    onError={(e) => (e.target.src = "/img/illustration.svg")}
                />
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>
            </div>

            {/* RIGHT SIDE FORM (Cho phép cuộn nội bộ) */}
            <div className="flex flex-col justify-start items-center w-full md:w-1/2 px-8 py-10 overflow-y-auto">
                {/* (Wrapper này để căn giữa form) */}
                <div className="max-w-sm w-full">
                    <RegisterFormContent />
                </div>
            </div>
        </div>
    );
};

export default Register;