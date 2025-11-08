import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Import Link để điều hướng
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import FacebookLogin from '@greatsumini/react-facebook-login';
import {AuthController} from "../controllers/AuthController";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Login = () => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleNormalLogin = async (e) => {
        e.preventDefault();
        try {
            //  Gọi API (Backend set cookie)
            const data = await AuthController.login(identifier, password);
            login(data.user);
            toast.success("Đăng nhập thành công!");
            setTimeout(() => {
                if (data.user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }, 1500);
        } catch (error) {
            toast.error(error.message || "Đăng nhập thất bại!");
        }
    };

    const handleGoogleLoginSuccess = async (tokenResponse) => {
        try {
            const accessToken = tokenResponse.access_token;
            // 1. Gọi API (Backend set cookie)
            const res = await AuthController.googleLogin(accessToken);
            console.log(res);

            login(res.user);

            toast.success("Đăng nhập Google thành công!");
            console.log(res.user.role);
            setTimeout(() => {
                if (res.user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }, 1500);
            // }
        } catch (error) {
            console.error("Google login error:", error);
            toast.error("Đăng nhập Google thất bại!");
        }
    };

    const handleGoogleLoginError = () => {
        console.log("Đăng nhập Google thất bại");
        toast.error("Đăng nhập Google thất bại!");
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: handleGoogleLoginError,
    });
    const handleFacebookLoginSuccess = async (response) => {
        console.log("Facebook response:", response);
        if (response.accessToken) {
            try {
                // 1. Gửi accessToken lên backend
                const res = await AuthController.facebookLogin(response.accessToken);

                // 2. Báo cho AuthContext
                login(res.user);

                toast.success("Đăng nhập Facebook thành công!");

                // 3. Điều hướng
                setTimeout(() => {
                    if (res.user.role === "admin") {
                        navigate("/admin");
                    } else {
                        navigate("/");
                    }
                }, 1500);
            } catch (error) {
                toast.error(error.message || "Đăng nhập Facebook thất bại!");
            }
        } else {
            toast.error("Không lấy được access token từ Facebook.");
        }
    };

    const handleFacebookLoginError = () => {
        console.log("Đăng nhập Facebook thất bại");
        toast.error("Đăng nhập Facebook thất bại!");
    };
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

            {/* HÌNH BÊN TRÁI (GHIM CỐ ĐỊNH) */}
            <div className="hidden md:flex w-1/2 bg-[#f3f5ff] items-center justify-center relative">
                <img
                    src="/img/illustration.svg"
                    alt="Login Illustration"
                    className="max-w-md w-4/5"
                    onError={(e) => (e.target.src = "default.png")}
                />
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>
            </div>

            {/* FORM NẰM BÊN PHẢI (CHO PHÉP CUỘN) */}
            <div className="flex flex-col justify-start items-center w-full md:w-1/2 px-8 py-10 overflow-y-auto">
                <div className="md:hidden absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>
                <div className="max-w-sm w-full mt-24 md:mt-0">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                        <img src="/img/name.png" alt="Logo" className="h-48 w-auto" />
                    </h1>
                    <h3 className="text-gray-600 mb-6">
                        Gửi trọn niềm tin, nhận trọn giá trị
                    </h3>

                    {/* (Các nút Google/Facebook không đổi) */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <button
                            type="button"
                            className="flex-1 w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 flex items-center justify-center gap-3 
                                       hover:bg-gray-50 transition-all shadow-sm font-medium text-gray-700"
                            onClick={() => googleLogin()}
                        >
                            <FcGoogle className="text-xl" />
                            Tài khoản Google
                        </button>
                        <FacebookLogin
                            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                            onSuccess={handleFacebookLoginSuccess}
                            onFail={handleFacebookLoginError}
                            // THÊM CÁI NÀY NẾU FEN DÙNG NÚT CUSTOM CỦA MÌNH
                            render={({ onClick, logout }) => (
                                <button
                                    type="button"
                                    onClick={onClick} // 👈 ĐÂY MỚI LÀ CHỖ GỌI HÀM CỦA THƯ VIỆN
                                    className="flex-1 w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                >
                                    <FaFacebook className="text-xl text-blue-600" />
                                    Tài khoản Facebook
                                </button>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-center mb-6">
                        <hr className="w-1/4 border-gray-300" />
                        <span className="mx-3 text-gray-400 text-sm">Hoặc đăng nhập với ...</span>
                        <hr className="w-1/4 border-gray-300" />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleNormalLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tài khoản</label>
                            <input
                                type="text"
                                placeholder="Nhập tên tài khoản hoặc email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="accent-blue-600" /> Ghi nhớ tài khoản này
                            </label>

                            {/* === THAY ĐỔI HIỆU ỨNG TẠI ĐÂY === */}
                            <Link to="/forgot-password" // Dùng Link và href
                                className="text-blue-600 inline-block transition-all duration-200 hover:-translate-y-0.5">
                                Quên mật khẩu ?
                            </Link>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6 pb-10">
                        Lần đầu bạn đến với PhoneWorld?{" "}

                        {/* === THAY ĐỔI HIỆU ỨNG TẠI ĐÂY === */}
                        <Link to="/register" // Dùng Link và href
                            className="text-blue-600 inline-block transition-all duration-200 hover:-translate-y-0.5">
                            Tạo tài khoản!
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Login;