import { AuthController } from "../controllers/AuthController";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
const Register = () => {
    // Khai báo state để quản lý form data
    const [formData, setFormData] = useState({
        name: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    // Hàm xử lý khi người dùng thay đổi giá trị trong các input
    const handleChange = (e) => {
        setFormData({
            ...formData,// Giữ nguyên các giá trị khác
            [e.target.name]: e.target.value // Cập nhật giá trị mới cho trường đang thay đổi
        });
    };

    // Hàm xử lý khi người dùng submit form
    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu và xác nhận mật khẩu không khớp!");
            return;
        }
        try {
            const data = await AuthController.register(formData);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
        } catch (error) {
            alert(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    // Giao diện trang đăng ký
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* LEFT SIDE IMAGE */}
            <div className="hidden md:flex w-1/2 bg-[#f3f5ff] items-center justify-center">
                <img
                    src="/img/register-illustration.svg"
                    alt="Register Illustration"
                    className="max-w-md w-4/5"
                    onError={(e) => (e.target.src = "/img/illustration.svg")}
                />
            </div>

            {/* RIGHT SIDE FORM */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-10">
                {/* Logo */}
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />

                </div>
                {/* Form Container */}
                <div className="max-w-sm w-full mt-20 md:mt-0">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                        Tạo tài khoản
                    </h1>
                    <h3 className="text-gray-600 mb-6">
                        Cùng PhoneWorld kết nối và trải nghiệm dịch vụ tốt nhất!
                    </h3>

                    {/* Social Register */}
                    <div className="flex gap-4 mb-6">
                        <button className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50">
                            <FcGoogle className="text-xl" /> Đăng ký với Google
                        </button>
                        <button className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50">
                            <FaFacebook className="text-blue-600 text-lg" /> Đăng ký với Facebook
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center mb-6">
                        <hr className="w-1/4 border-gray-300" />
                        <span className="mx-3 text-gray-400 text-sm">Hoặc</span>
                        <hr className="w-1/4 border-gray-300" />
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Họ và tên</label>
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
                            <label className="block text-sm font-medium mb-1">Email</label>
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

                        <div>
                            <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
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
                            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Tạo mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* <div className="flex items-center text-sm text-gray-600">
                            <input type="checkbox" className="accent-blue-600 mr-2" />
                            Tôi đồng ý với{" "}
                            <a href="#" className="text-blue-600 hover:underline ml-1">
                                Điều khoản & Chính sách bảo mật
                            </a>
                        </div> */}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
                        >
                            Đăng ký
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
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
