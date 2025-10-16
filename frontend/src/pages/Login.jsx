import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { AuthController } from "../controllers/AuthController";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
const Login = () => {

    //sử dụng context để lấy hàm login
    const { login } = useAuth();

    //khai báo các state để lưu trữ thông tin đăng nhập
    const [identifier, setIdentifier] = useState(""); //có thể là username hoặc email
    const [password, setPassword] = useState("");

    //khai báo hàm navigate để chuyển hướng trang
    const navigate = useNavigate();

    //Đăng nhập bằng tài khoản thường
    const handleNormalLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await AuthController.login(identifier, password);
            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (error) {
            alert(error.message || "Đăng nhập thất bại!");
        }
    };
    // 🟥 Google Login
    const handleSuccess = async (credentialResponse) => {
        try {
            const tokenId = credentialResponse.credential;
            console.log("Google ID Token:", tokenId);
            console.log(window.location.origin);


            const res = await AuthController.googleLogin(tokenId);

            if (res.token) {
                login(res.token, res.user);
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Google login error:", error);
        }
    };




    // // 🟦 Facebook Login (tương tự)
    // const handleFacebookLogin = async () => {
    //     const fbRes = await AuthController.facebookLogin();
    //     if (fbRes.token) {
    //         login(fbRes.token, fbRes.user);
    //         window.location.href = "/";
    //     }
    // };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* HÌNH BÊN TRÁI*/}
            <div className="hidden md:flex w-1/2 bg-[#f3f5ff] items-center justify-center">
                <img
                    src="/img/illustration.svg"
                    alt="Login Illustration"
                    className="max-w-md w-4/5"
                    onError={(e) => (e.target.src = "default.png")}
                />
            </div>

            {/* FORM NẰM BÊN PHẢI */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-10">
                {/* Logo */}
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />

                </div>

                {/* NỘI DUNG FORM */}
                <div className="max-w-sm w-full mt-20 md:mt-0">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-1">

                        <img src="/img/name.png" alt="Logo" className="h-48 w-auto" />

                    </h1>
                    <h3 className="text-gray-600 mb-6">
                        Gửi trọn niềm tin, nhận trọn giá trị
                    </h3>
                    {/* DĂNG NHẬP BẰNG HÌNH THỨC KHÁC */}
                    <div className="flex gap-4 mb-6">
                        {/* Đăng nhập bằng google */}
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => console.log("Đăng nhập Google thất bại")}
                            useOneTap={false}
                            ux_mode="popup"
                            render={(renderProps) => (
                                <button
                                    className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled}
                                >
                                    <FcGoogle className="text-xl" />
                                    Tài khoản Google
                                </button>
                            )}
                        />

                        {/* Đăng nhập bằng facebook */}
                        <button
                            className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50">
                            <FaFacebook className="text-blue-600 text-lg" /> Tài khoản FaceBook
                        </button>
                    </div>

                    {/* Divider */}
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
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="accent-blue-600" /> Ghi nhớ tài khoản này
                            </label>
                            <a href="#" className="text-blue-600 hover:underline">
                                Quên mật khẩu ?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Lần đầu bạn đến với PhoneWorld?{" "}
                        <a href="#" className="text-blue-600 hover:underline"
                            onClick={() => navigate("/register")}>
                            Tạo tài khoản!
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Login;