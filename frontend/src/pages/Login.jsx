// frontend/src/pages/Auth/Login.jsx
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import FacebookLogin from '@greatsumini/react-facebook-login';
import { AuthController } from "../controllers/AuthController";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthSide from "../components/common/AuthSide"; // Import Component mới

const Login = () => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleNormalLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await AuthController.login(identifier, password);
            login(data.user);
            toast.success("Đăng nhập thành công!");
            setTimeout(() => {
                if (data.user.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            }, 1500);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const data = await AuthController.googleLogin(tokenResponse.access_token);
                login(data.user);
                toast.success("Đăng nhập Google thành công!");
                setTimeout(() => {
                    if (data.user.role === "admin") {
                        navigate("/admin/dashboard");
                    } else {
                        navigate("/");
                    }
                }, 1500);
            } catch (error) {
                toast.error("Lỗi đăng nhập Google: " + error.message);
            }
        },
        onError: () => toast.error("Đăng nhập Google thất bại"),
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
                        navigate("/admin/dashboard");
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

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">

            {/* SỬ DỤNG COMPONENT MỚI */}
            <AuthSide imgSrc="/img/login-illustration.svg" />

            {/* RIGHT SIDE FORM */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-10 overflow-y-auto bg-white">

                {/* Logo cho Mobile */}
                <div className="md:hidden absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>

                <div className="max-w-sm w-full mt-24 md:mt-0">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-1">Xin chào!</h1>
                    <h3 className="text-gray-600 mb-6">
                        Đăng nhập để tiếp tục trải nghiệm PhoneWorld
                    </h3>

                    {/* Social Login Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => handleGoogleLogin()}
                            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition"
                        >
                            <FcGoogle className="w-5 h-5" /> Google
                        </button>

                        <div className="flex-1">
                            <FacebookLogin
                                appId="1089633542906282"
                                onSuccess={handleFacebookLoginSuccess}
                                onFail={(error) => console.log('Login Failed!', error)}
                                onProfileSuccess={(response) => console.log('Get Profile Success!', response)}
                                render={({ onClick }) => (
                                    <button onClick={onClick} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition text-gray-700">
                                        <FaFacebook className="w-5 h-5 text-blue-600" /> Facebook
                                    </button>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-6">
                        <hr className="w-1/4 border-gray-300" />
                        <span className="mx-3 text-gray-400 text-sm">Hoặc đăng nhập bằng</span>
                        <hr className="w-1/4 border-gray-300" />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleNormalLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên đăng nhập / Email</label>
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập hoặc email"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-all duration-200 transform hover:scale-110"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-600">
                                <input type="checkbox" className="mr-2 rounded text-blue-600" /> Ghi nhớ tài khoản này
                            </label>
                            <Link to="/forgot-password"
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
                        <Link to="/register"
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