import { AuthController } from "../controllers/AuthController";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
// 1. Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const navigate = useNavigate();

    // Khai báo state để quản lý form data
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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

    const handleRegister = async (e) => {
        e.preventDefault();

        // 2. Thay thế alert bằng Toast
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            const registerFormData = new FormData();
            for (const key in formData) {
                if (key !== 'confirmPassword') {
                    registerFormData.append(key, formData[key]);
                }
            }
            if (avatarFile) {
                registerFormData.append('avatar', avatarFile);
            }

            // Hiển thị toast loading (nếu muốn)
            // const registerToast = toast.loading("Đang xử lý...");

            const data = await AuthController.register(registerFormData);

            // Cập nhật toast thành công
            // toast.update(registerToast, { render: "Đăng ký thành công!", type: "success", isLoading: false, autoClose: 2000 });

            // Hoặc dùng toast success đơn giản
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");

            // Chuyển hướng sau 2 giây
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            // Cập nhật toast lỗi (nếu dùng loading)
            // if (registerToast) {
            //     toast.update(registerToast, { render: error.message || "Đăng ký thất bại.", type: "error", isLoading: false, autoClose: 3000 });
            // } else {
            //     toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
            // }

            // Toast lỗi đơn giản
            toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    return (
        // 3. NÂNG CẤP LAYOUT (FIXED IMAGE & LOGO)
        // Thay min-h-screen bằng h-screen (chiều cao viewport)
        // Thêm overflow-hidden để ngăn trang chính cuộn
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            {/* 4. Thêm <ToastContainer /> để hiển thị thông báo */}
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
            {/* Thêm 'relative' để logo định vị theo nó */}
            <div className="hidden md:flex w-1/2 bg-[#f3f5ff] items-center justify-center relative">
                <img
                    src="/img/register-illustration.svg"
                    alt="Register Illustration"
                    className="max-w-md w-4/5"
                    onError={(e) => (e.target.src = "/img/illustration.svg")}
                />

                {/* 5. Chuyển Logo vào đây để được ghim cố định */}
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>
            </div>

            {/* RIGHT SIDE FORM (Cho phép cuộn nội bộ) */}
            {/* Thêm 'overflow-y-auto' để chỉ form này cuộn, không phải cả trang */}
            <div className="flex flex-col justify-start items-center w-full md:w-1/2 px-8 py-10 overflow-y-auto">

                {/* Logo (chỉ hiển thị trên mobile, vì desktop đã có ở bên trái) */}
                <div className="md:hidden absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>

                {/* Form Container */}
                {/* Thêm 'mt-24 md:mt-0' để không bị logo mobile đè lên */}
                <div className="max-w-sm w-full mt-24 md:mt-0">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                        Tạo tài khoản
                    </h1>
                    <h3 className="text-gray-600 mb-6">
                        Cùng PhoneWorld kết nối và trải nghiệm dịch vụ tốt nhất!
                    </h3>

                    {/* Divider */}
                    <div className="flex items-center justify-center mb-6">
                        <hr className="w-1/4 border-gray-300" />
                        <span className="mx-3 text-gray-400 text-sm">Đăng ký bằng email</span>
                        <hr className="w-1/4 border-gray-300" />
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* ... (Các trường Name, Email, Phone, DoB không đổi) ... */}
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
                                    Ngày sinh <span className="text-gray-500 text-xs">(tùy chọn)</span>
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

                        {/* MẬT KHẨU (Nâng cấp hiệu ứng) */}
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
                                    // 6. THÊM HIỆU ỨNG (ANIMATION)
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

                        {/* XÁC NHẬN MẬT KHẨU (Nâng cấp hiệu ứng) */}
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
                                    // 6. THÊM HIỆU ỨNG (ANIMATION)
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

                        {/* Thêm khoảng đệm dưới cùng để cuộn dễ chịu hơn */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6 pb-10">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Đăng nhập ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;