import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaSearch, FaBars, FaTimes,
  FaHome, FaBox, FaInfoCircle, FaPhoneAlt,
  FaSignOutAlt, FaAngleDown,
  FaUserCircle, FaChartBar, FaBell, FaCommentDots
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

// 👇 IMPORT CONTROLLER THAY VÌ API TRỰC TIẾP
import { ProductController } from '../../controllers/productController';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // State Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Notifications
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Đơn hàng #1234", message: "Đã giao thành công", isRead: false, time: "2 giờ trước" },
    { id: 2, title: "Khuyến mãi", message: "Giảm 50% cho iPhone 15", isRead: true, time: "1 ngày trước" }
  ]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Refs
  const avatarMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Detect Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAvatarMenuOpen(false);
    setIsNotificationOpen(false);
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info("Đã đăng xuất thành công");
  };

  // --- LOGIC TÌM KIẾM (ĐÃ NÂNG CẤP) ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // 👇 GỌI QUA PRODUCT CONTROLLER
        const products = await ProductController.searchProducts(value);
        setSuggestions(products);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleSuggestionClick = (product) => {
    // Hỗ trợ nhiều kiểu ID/Slug
    const productId = product.slug || product.productId || product._id;
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
    setSearchTerm('');
    setIsMobileSearchOpen(false);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || user?.userName || user?.email?.split('@')[0] || "Khách";

  const navLinks = [
    { name: 'Trang chủ', path: '/', icon: FaHome },
    { name: 'Sản phẩm', path: '/products', icon: FaBox },
    { name: 'Giới thiệu', path: '/about', icon: FaInfoCircle },
    { name: 'Liên hệ', path: '/contact', icon: FaPhoneAlt },
  ];

  // --- UI GỢI Ý SẢN PHẨM ---
  const SearchSuggestionsList = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    return (
      <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-2xl mt-2 border border-gray-100 overflow-hidden z-[60] animate-fade-in-up">
        <div className="p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Gợi ý sản phẩm
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {suggestions.map((product) => {
            // Xử lý ảnh (Dùng helper của Controller nếu cần, hoặc logic tại chỗ)
            const img = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0].url || product.images[0]
              : (product.image || '/placeholder.png');

            // Sử dụng ProductController.getImageUrl để đảm bảo full path nếu cần
            const fullImgUrl = ProductController.getImageUrl(img);

            return (
              <div
                key={product._id}
                onClick={() => handleSuggestionClick(product)}
                className="flex items-center gap-3 p-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex-shrink-0 overflow-hidden">
                  <img src={fullImgUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.productName || product.name}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">
                    {(Number(product.price) || 0).toLocaleString()} ₫
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div
          onClick={handleSearchSubmit}
          className="p-3 text-center text-xs text-indigo-600 font-bold hover:bg-indigo-50 cursor-pointer border-t border-gray-100 uppercase tracking-wide"
        >
          Xem tất cả kết quả cho "{searchTerm}"
        </div>
      </div>
    );
  };

  return (
    <>
      {/* --- HEADER FIXED --- */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 border-b
          ${isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-gray-200/50 py-2'
            : 'bg-white backdrop-blur-sm border-transparent py-3'
          }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto relative">

          {/* ⚡ MOBILE SEARCH OVERLAY (Hiện khi bấm kính lúp trên mobile) */}
          <AnimatePresence>
            {isMobileSearchOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 z-50 bg-white px-4 flex items-center gap-3 h-full shadow-sm md:hidden"
              >
                <form onSubmit={handleSearchSubmit} className="flex-1 relative" ref={searchContainerRef}>
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent border focus:bg-white focus:border-indigo-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchTerm) setShowSuggestions(true) }}
                  />
                  {/* Gợi ý Mobile */}
                  <SearchSuggestionsList />
                </form>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
                >
                  Hủy
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ⚡ HEADER CONTENT (Ẩn khi đang search mobile) */}
          <div className={`flex justify-between items-center h-14 md:h-16 gap-4 ${isMobileSearchOpen ? 'invisible md:visible' : ''}`}>

            {/* 1. LOGO */}
            <div className="flex-shrink-0 flex items-center cursor-pointer gap-3 group" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200/50 group-hover:rotate-3 transition-transform duration-300">
                <span className="font-black text-xl tracking-tighter">PW</span>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight leading-none">
                  PhoneWorld
                </h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-[0.2em] uppercase mt-0.5">Premium Store</p>
              </div>
            </div>

            {/* 2. CENTER: NAV & SEARCH (DESKTOP) */}
            <div className="hidden md:flex flex-1 items-center justify-center max-w-4xl px-8 gap-6">
              {/* Nav Links */}
              <nav className="flex items-center space-x-1 flex-shrink-0">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`
                          relative px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap
                          ${isActive
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                        }
                        `}
                    >
                      <link.icon className={`text-lg ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                      <span className="hidden xl:inline">{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* SEARCH BAR DESKTOP */}
              <div className="relative flex-1 w-full max-w-md group z-50" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent border focus:bg-white focus:border-indigo-500 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchTerm) setShowSuggestions(true) }}
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </form>
                {/* Gợi ý Desktop */}
                <SearchSuggestionsList />
              </div>
            </div>

            {/* 3. RIGHT ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Mobile Search Icon */}
              <button
                className="md:hidden p-2.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <FaSearch className="text-lg" />
              </button>

              {/* Chat Button */}
              <Link
                to="/profile?tab=chat"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all"
                title="Tin nhắn"
              >
                <FaCommentDots className="text-xl" />
              </Link>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative" ref={notificationMenuRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative
                              ${isNotificationOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}
                          `}
                  >
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 ring-1 ring-black/5"
                      >
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                          <h3 className="font-bold text-gray-800 text-base">Thông báo</h3>
                          <button onClick={markAllAsRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                            Đánh dấu đã đọc
                          </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                              <FaBell className="text-3xl opacity-20 mb-2" />
                              <p className="text-sm font-medium">Không có thông báo mới</p>
                            </div>
                          ) : (
                            <ul className="divide-y divide-gray-50">
                              {notifications.map((item) => (
                                <li key={item.id} className={`p-4 hover:bg-indigo-50/30 transition-colors cursor-pointer ${!item.isRead ? 'bg-indigo-50/10' : ''}`}>
                                  <div className="flex gap-3">
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!item.isRead ? 'bg-indigo-500 shadow-glow' : 'bg-transparent'}`}></div>
                                    <div>
                                      <p className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{item.title}</p>
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.message}</p>
                                      <p className="text-[10px] text-gray-400 mt-2 font-medium">{item.time}</p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center">
                          <Link to="/notifications" className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors block py-2">
                            Xem tất cả
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all group active:scale-95">
                <FaShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative pl-2 border-l border-gray-200 ml-2" ref={avatarMenuRef}>
                {isAuthenticated ? (
                  <div
                    className="flex items-center cursor-pointer group p-1 pr-3 rounded-full hover:bg-gray-100/80 transition-all border border-transparent hover:border-gray-200"
                    onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-md group-hover:shadow-indigo-200 transition-all">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-indigo-600 text-sm">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Info */}
                    <div className="hidden xl:block ml-2.5 text-left">
                      <p className="text-sm font-bold text-gray-800 leading-none max-w-[100px] truncate">{displayName}</p>
                      <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-wider bg-indigo-50 inline-block px-1.5 py-0.5 rounded-md">
                        {isAdmin ? 'Admin' : (user?.membershipTier || 'Member')}
                      </p>
                    </div>

                    <FaAngleDown className={`ml-3 text-gray-400 text-xs transition-transform duration-200 ${isAvatarMenuOpen ? 'rotate-180' : ''}`} />

                    {/* Dropdown Content */}
                    <AnimatePresence>
                      {isAvatarMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50 ring-1 ring-black/5 origin-top-right"
                        >
                          <div className="px-5 py-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-indigo-100/50">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Tài khoản</p>
                            <p className="font-bold text-gray-900 text-lg truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate font-medium">{user?.email}</p>
                          </div>

                          <div className="p-2 space-y-1">
                            {isAdmin && (
                              <Link to="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 group transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                                  <FaChartBar className="text-sm" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">Quản trị hệ thống</p>
                                  <p className="text-[10px] text-gray-400 font-medium">Dashboard & Thống kê</p>
                                </div>
                              </Link>
                            )}

                            <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 group transition-colors">
                              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                                <FaUserCircle className="text-sm" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">Hồ sơ cá nhân</p>
                                <p className="text-[10px] text-gray-400 font-medium">Thông tin & Đơn hàng</p>
                              </div>
                            </Link>
                          </div>

                          <div className="border-t border-gray-100 mt-1 p-2">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                              <FaSignOutAlt /> Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                      <FaUserPlus /> <span>Đăng ký</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors ml-1"
              >
                <FaBars className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. MOBILE MENU DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-50 md:hidden overflow-y-auto flex flex-col"
              >
                <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                  <span className="font-bold text-xl text-gray-800 tracking-tight">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 transition-colors">
                    <FaTimes />
                  </button>
                </div>

                <nav className="p-4 space-y-1 flex-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center px-4 py-3.5 rounded-xl text-base font-bold transition-all mb-1
                        ${location.pathname === link.path
                          ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                        }
                      `}
                    >
                      <link.icon className={`mr-3 text-lg ${location.pathname === link.path ? 'text-indigo-600' : 'text-gray-400'}`} />
                      {link.name}
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 bg-indigo-50/50 rounded-xl mx-2 border border-indigo-100/50">
                          <p className="text-xs text-gray-400 uppercase font-bold">Tài khoản đang dùng</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-gray-800 truncate">{displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <Link to="/profile" className="flex items-center px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-purple-50 hover:text-purple-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          <FaUserCircle className="mr-3 text-xl text-purple-500" />Hồ sơ cá nhân
                        </Link>

                        {isAdmin && (
                          <Link to="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            <FaChartBar className="mr-3 text-xl text-blue-500" /> Quản trị hệ thống
                          </Link>
                        )}

                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-bold mt-2">
                          <FaSignOutAlt className="mr-3 text-xl" />Đăng xuất
                        </button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center items-center py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition">
                          Đăng nhập
                        </Link>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center items-center py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                          Đăng ký
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* ✅ SPACER DIV: Giúp nội dung không bị che mất bởi Header Fixed */}
      <div className="h-14 md:h-16 w-full" />
    </>
  );
};

export default Header;