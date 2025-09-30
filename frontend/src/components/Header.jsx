// src/components/Header.jsx
import React from "react";

const Header = () => {
    return (
        <header className="bg-sky-400 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                {/* Logo */}
                <h1 className="text-2xl font-bold text-white drop-shadow-md">MyShop</h1>

                {/* Menu */}
                <nav className="space-x-6">
                    <a href="/" className="text-white font-medium hover:text-yellow-300 transition">Trang chủ</a>
                    <a href="/products" className="text-white font-medium hover:text-yellow-300 transition">Sản phẩm</a>
                    <a href="/about" className="text-white font-medium hover:text-yellow-300 transition">Giới thiệu</a>
                    <a href="/contact" className="text-white font-medium hover:text-yellow-300 transition">Liên hệ</a>
                </nav>

                {/* Search + Cart */}
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <button className="bg-white text-sky-600 px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 hover:text-white transition">
                        Giỏ hàng
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
