// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa'; // Import icon cho Social
import { toast } from 'react-toastify';

// Import các thành phần cần thiết
import AuthSide from '../components/common/AuthSide';
import { useAuth } from '../context/AuthContext';
import { AuthController } from '../controllers/AuthController';

const ForgotPassword = () => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 1. Logic kiểm tra Social Login (Theo yêu cầu của bạn)
    // Chỉ kiểm tra khi user ĐÃ ĐĂNG NHẬP mà lại vào trang này
    const isSocialLogin = user?.provider?.includes('google') || user?.provider?.includes('facebook');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Vui lòng nhập email.");
            return;
        }

        setIsLoading(true);
        try {
            // Gọi API gửi email
            const success = await AuthController.forgotPassword(email);
            
            if (success) {
                setIsSubmitted(true);
                toast.success("Đã gửi email khôi phục!");
            }
        } catch (error) {
            toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };


    // 3. Render UI: Form nhập Email (Mặc định)
    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            
            {/* UI BÊN TRÁI (AUTH SIDE) */}
            <AuthSide imgSrc="/img/forgot-password-illustration.svg" />

            {/* UI BÊN PHẢI (FORM) */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-10 overflow-y-auto bg-white">
                {/* Logo cho mobile */}
                <div className="md:hidden absolute top-6 left-6">
                    <img src="/img/logo.svg" alt="Logo" className="h-16 w-auto" />
                </div>

                <div className="max-w-sm w-full mt-24 md:mt-0">
                    
                    {/* TRẠNG THÁI: ĐÃ GỬI THÀNH CÔNG */}
                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheckCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã gửi email!</h2>
                            <p className="text-gray-600 mb-6">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>. 
                                Vui lòng kiểm tra hộp thư (kể cả mục Spam).
                            </p>
                            <div className="space-y-3">
                                <Link to="/login" className="block w-full bg-blue-600 text-white rounded-md py-2.5 font-medium hover:bg-blue-700 transition text-center">
                                    Quay lại đăng nhập
                                </Link>
                                <button 
                                    onClick={() => setIsSubmitted(false)} 
                                    className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                                >
                                    Thử lại với email khác
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* TRẠNG THÁI: FORM NHẬP LIỆU */
                        <>
                            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Quên mật khẩu?</h1>
                            <p className="text-gray-600 mb-8 text-sm">
                                Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email đăng ký
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="nguyenvana@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Gửi hướng dẫn'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <FiArrowLeft /> Quay lại đăng nhập
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;