import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthController } from '../../controllers/AuthController';
import { Menu } from "lucide-react"; // icon 3 gạch

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); //  kiểm tra đăng nhập
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    //  Kiểm tra đăng nhập khi load trang
    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        // Lắng nghe sự kiện storage (cập nhật khi login/logout)
        window.addEventListener("storage", checkLogin);

        // Kiểm tra ban đầu
        checkLogin();

        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    // Xử lý mở/đóng dropdown
    const handleToggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };
    // Đóng dropdown khi click ngoài
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    // Lắng nghe sự kiện click ngoài để đóng dropdown
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Xử lý đăng xuất localStorage và chuyển hướng
    // Sau này có đổi sang dùng API dùng cookie thì sửa lại chỗ này
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await AuthController.logout();
            alert("Đăng xuất thành công!");
        } catch (error) {
            alert(error.message || "Đăng xuất thất bại!");
        }
    };
    return (
        <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-blue-600 shadow-md">
            {/* Logo */}
            <div className="flex items-center justify-between w-full mb-2 md:mb-0 md:w-auto">
                <div className="flex items-center space-x-2">
                    <button className="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                    <span className="font-bold text-lg text-white">Tên Ứng Dụng</span>
                </div>
            </div>

            {/* Tìm kiếm */}
            <div className="flex-grow md:flex md:justify-center mb-2 md:mb-0">
                <input
                    type="text"
                    placeholder="Bạn muốn mua gì hôm nay..."
                    className="p-2 border border-gray-300 rounded-lg w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Người dùng */}
            <div className="flex items-center space-x-4">
                {/* Giỏ hàng */}
                <button className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3z" />
                    </svg>
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>

                {/* Dropdown người dùng */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="text-white hover:shadow-lg hover:text-blue-400"
                        onClick={handleToggleDropdown}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-300 transition duration-200 ease-in-out">
                            {!isLoggedIn ? (
                                <>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 hover:border-l-4 hover:border-blue-400 transition duration-150 ease-in-out"
                                        onClick={() => navigate("/login")}
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 hover:border-l-4 hover:border-blue-400 transition duration-150 ease-in-out"
                                        onClick={() => navigate("/register")}
                                    >
                                        Đăng ký
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 hover:border-l-4 hover:border-blue-400 transition duration-150 ease-in-out"
                                        onClick={() => navigate("/profile")}
                                    >
                                        Thông tin của tôi
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-red-100 hover:border-l-4 hover:border-red-400 transition duration-150 ease-in-out"
                                        onClick={() => navigate("/logout")}
                                    >
                                        Đăng xuất
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
