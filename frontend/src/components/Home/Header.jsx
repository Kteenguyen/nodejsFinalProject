// frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaSearch, FaUser, FaBars, FaTimes,
  FaHome, FaBox, FaInfoCircle, FaPhoneAlt, FaSignInAlt,
  FaUserPlus, FaSignOutAlt, FaAngleDown,
  FaUserCircle, FaEnvelope, FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';      // NOTE: nếu file ở src/components/Header.jsx => đổi thành '../context/AuthContext'
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const avatarMenuRef = useRef(null);

  // === xác định có phải admin không ===
  const roleRaw =
    (user?.role ??
      (Array.isArray(user?.roles) ? user.roles[0] : '') ??
      ''
    ).toString().toLowerCase();
  const isAdmin =
    roleRaw === 'admin' || roleRaw === 'administrator' || roleRaw === 'superadmin';

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${searchTerm.trim()}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsAvatarMenuOpen(false);
    try {
      await logout();
      toast.success('Đã đăng xuất thành công!');
      navigate('/login');
    } catch {
      toast.error('Đăng xuất thất bại.');
    }
  };

  const userDisplayName = user?.username || user?.email?.split('@')[0] || 'Người dùng';
  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${userDisplayName}&background=76ABAE&color=222831`;

  const mobileMenuBackdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const mobileMenuPanel = {
    hidden: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
    visible: { x: 0, transition: { type: 'tween', duration: 0.3 } },
  };
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  return (
    <header className="bg-primary text-text-on-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold hover:text-white transition-colors shrink-0">
          PHONEWORLD
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center space-x-6 mx-4">
          <Link to="/" className="nav-link-dark">Trang chủ</Link>
          <Link to="/products" className="nav-link-dark">Sản phẩm</Link>
          <Link to="/about" className="nav-link-dark">Về chúng tôi</Link>
          <Link to="/contact" className="nav-link-dark">Liên hệ</Link>
        </nav>

        {/* Right icons */}
        <div className="flex flex-nowrap items-center space-x-1 sm:space-x-2">
          {/* Search (desktop) */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/[.20] border border-gray-600 rounded-md py-1.5 pl-4 pr-10 text-sm text-text-on-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-hover transition-all duration-300 w-40 hover:w-56"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <FaSearch className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Auth block */}
          <AnimatePresence mode="wait">
            {isAuthenticated ? (
              <motion.div
                key="avatar-menu"
                className="relative flex items-center"
                ref={avatarMenuRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="btn-avatar-header focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent"
                >
                  <img
                    src={avatarUrl}
                    alt={userDisplayName}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-accent-hover shadow-sm mr-2"
                  />
                  <span className="font-medium hidden md:block">{userDisplayName}</span>
                  <motion.div animate={{ rotate: isAvatarMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <FaAngleDown className="h-4 w-4 ml-2" />
                  </motion.div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isAvatarMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-2xl z-50 border border-white/[.20] bg-surface/[.95] backdrop-blur-xl overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-gray-500/[.20]">
                        <p className="text-sm font-medium text-text-primary truncate">{userDisplayName}</p>
                        <p className="text-xs text-text-secondary">{isAdmin ? 'Quản lý viên' : 'Khách hàng'}</p>
                      </div>

                      {/* CHỈ ADMIN thấy mục thống kê và quản lý */}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsAvatarMenuOpen(false)}
                            className="menu-item"
                          >
                            <FaChartBar className="mr-3 text-text-accent" /> Thống kê và biểu đồ
                          </Link>
                          <Link
                            to="/admin/management"
                            onClick={() => setIsAvatarMenuOpen(false)}
                            className="menu-item"
                          >
                            <FaChartBar className="mr-3 text-text-accent" /> Quản Lý
                          </Link>
                        </>
                      )}

                      <Link to="/profile" onClick={() => setIsAvatarMenuOpen(false)} className="menu-item">
                        <FaUserCircle className="mr-3 text-text-accent" /> Thông tin cá nhân
                      </Link>
                      <Link to="/messages" onClick={() => setIsAvatarMenuOpen(false)} className="menu-item">
                        <FaEnvelope className="mr-3 text-text-accent" /> Nhắn tin với shop
                      </Link>

                      <div className="border-t border-gray-200/[.50] my-1"></div>
                      <button onClick={handleLogout} className="menu-item-danger">
                        <FaSignOutAlt className="mr-3" /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="login-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Link to="/login" className="btn-accent-header" aria-label="Đăng nhập">
                  <FaUser className="h-5 w-5 mr-2" />
                  <span className="font-medium hidden md:block">Đăng nhập</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cart */}
          <Link to="/cart" className="relative btn-accent-header" aria-label="Giỏ hàng">
            <FaShoppingCart className="h-5 w-5 mr-2" />
            <span className="font-medium hidden md:block">Giỏ hàng</span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse-badge"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          {/* Hamburger */}
          <button className="btn-hamburger-header" onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu">
            <FaBars className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuBackdrop}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="panel"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuPanel}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-surface shadow-xl z-50 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center p-4 bg-primary text-text-on-dark">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold text-base truncate">{userDisplayName}</span>
                  </div>
                ) : (
                  <span className="font-semibold text-lg">Menu</span>
                )}
                <button className="p-1 rounded-md hover:bg-black/[.15]" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu">
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
                <form onSubmit={handleSearch} className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent p-1">
                    <FaSearch />
                  </button>
                </form>

                <Link to="/" className="mobile-nav-link"><FaHome className="mr-3 text-text-accent" />Trang chủ</Link>
                <Link to="/products" className="mobile-nav-link"><FaBox className="mr-3 text-text-accent" />Sản phẩm</Link>
                <Link to="/about" className="mobile-nav-link"><FaInfoCircle className="mr-3 text-text-accent" />Về chúng tôi</Link>
                <Link to="/contact" className="mobile-nav-link"><FaPhoneAlt className="mr-3 text-text-accent" />Liên hệ</Link>

                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="mobile-nav-link"><FaUserCircle className="mr-3 text-text-accent" />Tài khoản</Link>

                      {/* CHỈ ADMIN mới thấy ở mobile */}
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link text-text-accent"
                        >
                          <FaChartBar className="mr-3" /> Thống kê
                        </Link>
                      )}

                      <button onClick={handleLogout} className="mobile-nav-link w-full text-left text-red-500">
                        <FaSignOutAlt className="mr-3" />Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="mobile-nav-link"><FaSignInAlt className="mr-3" />Đăng nhập</Link>
                      <Link to="/register" className="mobile-nav-link"><FaUserPlus className="mr-3" />Đăng ký</Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
