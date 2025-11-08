// frontend/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import  {AuthController}  from '../controllers/AuthController';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { token } = useParams(); // Lấy token từ URL
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Dòng này giờ sẽ hoạt động
        const success = await AuthController.resetPassword(token, formData); 
        setLoading(false);
        if (success) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-text-primary mb-6">Đặt lại mật khẩu</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Mật khẩu mới</label>
                        <input
                            type="password" id="password" name="password"
                            value={formData.password} onChange={handleChange}
                            required className="input-field"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">Xác nhận mật khẩu</label>
                        <input
                            type="password" id="confirmPassword" name="confirmPassword"
                            value={formData.confirmPassword} onChange={handleChange}
                            required className="input-field"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="btn-accent w-full">
                            {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                .input-field { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent-hover focus:border-accent-hover; }
                .btn-accent { @apply w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent; }
            `}</style>
        </div>
    );
};

export default ResetPassword;