// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import {AuthController } from '../controllers/AuthController'; // Lấy từ userController (client)
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Dòng này giờ sẽ hoạt động
        await AuthController.forgotPassword(email); 
        setLoading(false);
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-text-primary mb-6">Quên mật khẩu</h2>
                <p className="text-center text-text-secondary mb-4">Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                        <input
                            type="email" id="email" name="email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="btn-accent w-full">
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-medium text-text-accent hover:text-accent-hover">
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
            <style jsx>{`
                .input-field { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent-hover focus:border-accent-hover; }
                .btn-accent { @apply w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent; }
            `}</style>
        </div>
    );
};

export default ForgotPassword;