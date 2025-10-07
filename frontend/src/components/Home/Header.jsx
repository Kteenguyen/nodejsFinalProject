import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    // Thêm sự kiện click ra ngoài
    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navigate= useNavigate();

    return (
        <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-blue-600 shadow-md">
            {/* Logo / Biểu tượng */}
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

            {/* Thanh tìm kiếm */}
            <div className="flex-grow md:flex md:justify-center mb-2 md:mb-0">
                <input
                    type="text"
                    placeholder="Bạn muốn mua gì hôm nay..."
                    className="p-2 border border-gray-300 rounded-lg w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Thông tin người dùng và giỏ hàng */}
            <div className="flex items-center space-x-4">
                {/* Giỏ hàng */}
                <button className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3z" />
                    </svg>
                    {/* Giỏ hàng */}
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>

                {/* Biểu tượng người dùng với dropdown */}
                <div
                    className="relative"
                    ref={dropdownRef}
                >
                    <button className="text-white hover:shadow-lg hover:text-blue-400" onClick={handleToggleDropdown}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-300 transition duration-200 ease-in-out"
                        >
                            <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 hover:border-l-4 hover:border-blue-400 transition duration-150 ease-in-out"
                            onClick={() => navigate("/login")}
                            >Đăng nhập</button>
                            <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100 hover:border-l-4 hover:border-blue-400 transition duration-150 ease-in-out"
                            onClick={() => navigate("/register")}>Đăng ký</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;