// frontend/src/pages/ProfilePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Không tìm thấy thông tin người dùng.</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Trang cá nhân</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-lg"><strong>Tên:</strong> {user.name}</p>
                <p className="text-lg"><strong>Email:</strong> {user.email}</p>
                <p className="text-lg"><strong>Username:</strong> {user.userName}</p>
                <p className="text-lg"><strong>Vai trò:</strong> {user.role}</p>
                <p className="text-lg"><strong>Provider:</strong> {user.provider.join(', ')}</p>
                {user.avatar && (
                    <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full mt-4" />
                )}
            </div>
        </div>
    );
};

export default ProfilePage;