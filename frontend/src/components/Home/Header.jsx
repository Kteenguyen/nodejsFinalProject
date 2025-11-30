// frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaSearch, FaUser, FaBars, FaTimes,
  FaHome, FaBox, FaInfoCircle, FaPhoneAlt, FaSignInAlt,
  FaUserPlus, FaSignOutAlt, FaAngleDown,
  FaUserCircle, FaEnvelope, FaChartBar, FaBell
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';      // NOTE: nếu file ở src/components/Header.jsx => đổi thành '../context/AuthContext'
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { OrderController } from '../../controllers/OrderController';
import { UserController } from '../../controllers/userController';
import { ProductController } from '../../controllers/productController';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    // Load từ localStorage khi khởi tạo
    try {
      const saved = localStorage.getItem('readNotificationIds');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const avatarMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // === xác định có phải admin không ===
  const roleRaw =
    (user?.role ??
      (Array.isArray(user?.roles) ? user.roles[0] : '') ??
      ''
    ).toString().toLowerCase();
  const isAdmin =
    roleRaw === 'admin' || roleRaw === 'administrator' || roleRaw === 'superadmin';

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        // Nếu là ADMIN - lấy thông báo kiểu admin (đơn hàng mới, user mới, sản phẩm hết hàng)
        if (isAdmin) {
          const allNotifications = [];
          
          // 1. Lấy đơn hàng Pending (đơn mới cần xử lý)
          try {
            const orders = await OrderController.getAllOrdersForAdmin();
            const pendingOrders = orders.filter(o => o.status === 'Pending');
            const orderNotifications = pendingOrders.slice(0, 5).map(order => ({
              _id: `order-${order._id}`,
              title: '🔔 Đơn hàng mới cần xử lý',
              message: `Đơn #${order._id.slice(-6)} - ${order.user?.name || 'Khách hàng'} - ${(order.totalPrice || 0).toLocaleString('vi-VN')}đ`,
              type: 'order',
              isRead: false,
              createdAt: order.createdAt,
              actionUrl: `/admin/orders/${order._id}`
            }));
            allNotifications.push(...orderNotifications);
          } catch (err) {
            console.log('Không thể lấy đơn hàng:', err);
          }
          
          // 2. Lấy người dùng mới đăng ký (7 ngày qua)
          try {
            const usersData = await UserController.getUsers({ page: 1, limit: 20 });
            const users = usersData.users || usersData.data || [];
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const newUsers = users.filter(u => new Date(u.createdAt) > sevenDaysAgo);
            const userNotifications = newUsers.slice(0, 3).map(u => ({
              _id: `user-${u._id}`,
              title: '👤 Người dùng mới',
              message: `${u.name || u.userName || u.email} đã đăng ký`,
              type: 'user',
              isRead: false,
              createdAt: u.createdAt,
              actionUrl: `/admin/users`
            }));
            allNotifications.push(...userNotifications);
          } catch (err) {
            console.log('Không thể lấy users:', err);
          }
          
          // 3. Lấy sản phẩm sắp hết / hết hàng
          try {
            const productsData = await ProductController.getProducts({ limit: 100 });
            const products = productsData.products || productsData.data || [];
            
            // Sản phẩm hết hàng
            const outOfStock = products.filter(p => p.stock === 0);
            const outStockNotifs = outOfStock.slice(0, 3).map(p => ({
              _id: `product-out-${p._id}`,
              title: '🚫 Sản phẩm hết hàng',
              message: `${p.name} - Cần nhập thêm hàng`,
              type: 'product',
              isRead: false,
              createdAt: new Date().toISOString(),
              actionUrl: `/admin/products/${p._id}/edit`
            }));
            allNotifications.push(...outStockNotifs);
            
            // Sản phẩm sắp hết (< 10)
            const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
            const lowStockNotifs = lowStock.slice(0, 3).map(p => ({
              _id: `product-low-${p._id}`,
              title: '⚠️ Sắp hết hàng',
              message: `${p.name} - Còn ${p.stock} sản phẩm`,
              type: 'product',
              isRead: false,
              createdAt: new Date().toISOString(),
              actionUrl: `/admin/products/${p._id}/edit`
            }));
            allNotifications.push(...lowStockNotifs);
          } catch (err) {
            console.log('Không thể lấy products:', err);
          }
          
          // Sắp xếp theo thời gian
          allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // Áp dụng trạng thái đã đọc từ localStorage
          const notificationsWithReadState = allNotifications.slice(0, 10).map(n => ({
            ...n,
            isRead: readNotificationIds.includes(n._id)
          }));
          
          setNotifications(notificationsWithReadState);
          setUnreadCount(notificationsWithReadState.filter(n => !n.isRead).length);
        } else {
          // USER THƯỜNG - lấy thông báo từ đơn hàng của user
          // Lấy đơn hàng gần nhất của user để tạo thông báo thực tế
          let orderNotifications = [];
          try {
            const ordersRes = await api.get('/orders/my-orders');
            const orders = ordersRes.data?.orders || ordersRes.data || [];
            
            // Tạo thông báo từ đơn hàng gần đây (tối đa 3 đơn)
            orderNotifications = orders.slice(0, 3).map((order, idx) => {
              const statusMessages = {
                'Pending': 'Đơn hàng đang chờ xác nhận',
                'Confirmed': 'Đơn hàng đã được xác nhận',
                'Shipping': 'Đơn hàng đang được giao',
                'Delivered': 'Đơn hàng đã giao thành công',
                'Cancelled': 'Đơn hàng đã bị hủy'
              };
              return {
                _id: `order-${order._id}`,
                title: statusMessages[order.status] || 'Cập nhật đơn hàng',
                message: `Đơn hàng #${order.orderId || order._id.slice(-6)} - ${(order.totalPrice || 0).toLocaleString('vi-VN')}đ`,
                type: 'order',
                isRead: readNotificationIds.includes(`order-${order._id}`),
                createdAt: order.updatedAt || order.createdAt,
                actionUrl: `/order/${order._id}` // Chuyển thẳng đến chi tiết đơn hàng
              };
            });
          } catch (orderErr) {
            console.log('Không thể lấy đơn hàng:', orderErr);
          }
          
          // Thông báo khuyến mãi mặc định
          const promoNotifications = [
            {
              _id: 'user-promo-1',
              title: 'Khuyến mãi đặc biệt',
              message: 'Giảm 20% cho tất cả sản phẩm điện tử trong tuần này!',
              type: 'promotion',
              isRead: readNotificationIds.includes('user-promo-1'),
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              actionUrl: '/products'
            },
            {
              _id: 'user-promo-2',
              title: 'Đổi điểm nhận quà',
              message: 'Bạn có điểm thưởng! Đổi ngay để nhận voucher giảm giá.',
              type: 'promotion',
              isRead: readNotificationIds.includes('user-promo-2'),
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
              actionUrl: '/redeem-vouchers'
            }
          ];
          
          // Gộp và sắp xếp theo thời gian
          const allNotifications = [...orderNotifications, ...promoNotifications]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setNotifications(allNotifications);
          setUnreadCount(allNotifications.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Lỗi fetch notifications:', error);
      }
    };
    
    fetchNotifications();
    // Refresh mỗi 60 giây
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, isAdmin, readNotificationIds]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
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

  const markAsRead = async (notificationId) => {
    // Cập nhật localStorage
    const newReadIds = [...readNotificationIds, notificationId];
    setReadNotificationIds(newReadIds);
    localStorage.setItem('readNotificationIds', JSON.stringify(newReadIds));
    
    // Gọi API cho user thường
    if (!isAdmin) {
      try {
        await api.put(`/notifications/${notificationId}/read`);
      } catch (err) {
        // Fallback for mock data
      }
    }
    
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // Cập nhật localStorage với tất cả IDs
    const allIds = notifications.map(n => n._id);
    const newReadIds = [...new Set([...readNotificationIds, ...allIds])];
    setReadNotificationIds(newReadIds);
    localStorage.setItem('readNotificationIds', JSON.stringify(newReadIds));
    
    // Gọi API cho user thường
    if (!isAdmin) {
      try {
        await api.put('/notifications/read-all');
      } catch (err) {
        // Fallback for mock data
      }
    }
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return '📦';
      case 'promotion': return '🎉';
      case 'system': return '⚙️';
      case 'user': return '👤';
      case 'product': return '📱';
      default: return '🔔';
    }
  };

  // Xử lý click vào notification
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setIsNotificationOpen(false);
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (isAdmin) {
      navigate('/admin/notifications');
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
                      className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 border border-gray-200 bg-white overflow-hidden"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-800 truncate">{userDisplayName}</p>
                        <p className="text-xs text-gray-500">{isAdmin ? 'Quản lý viên' : 'Khách hàng'}</p>
                      </div>

                      {/* CHỈ ADMIN thấy mục thống kê và quản lý */}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsAvatarMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FaChartBar className="mr-3 text-blue-500" /> Thống kê và biểu đồ
                          </Link>
                          <Link
                            to="/admin/management"
                            onClick={() => setIsAvatarMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FaChartBar className="mr-3 text-blue-500" /> Quản Lý
                          </Link>
                        </>
                      )}

                      <Link to="/profile" onClick={() => setIsAvatarMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <FaUserCircle className="mr-3 text-blue-500" /> Thông tin cá nhân
                      </Link>
                      <Link to="/messages" onClick={() => setIsAvatarMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <FaEnvelope className="mr-3 text-blue-500" /> Nhắn tin với shop
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
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

          {/* Notification Bell - Chỉ hiện khi đã đăng nhập */}
          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-text-on-dark hover:text-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
                aria-label="Thông báo"
              >
                <FaBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl z-50 border border-gray-200 bg-white overflow-hidden"
                    style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                        <FaBell className="mr-2 text-blue-500" />
                        Thông báo
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount} mới
                          </span>
                        )}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                        >
                          Đánh dấu đã đọc tất cả
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto bg-white">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400">
                          <FaBell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Không có thông báo nào</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                              !notification.isRead 
                                ? 'bg-blue-50 hover:bg-blue-100' 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            whileHover={{ x: 3 }}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl mt-0.5">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm font-medium truncate ${
                                    !notification.isRead ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 animate-pulse"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <Link
                      to={isAdmin ? "/admin/notifications" : "/notifications"}
                      onClick={() => setIsNotificationOpen(false)}
                      className="block px-4 py-3 text-center text-sm font-medium text-blue-500 hover:text-blue-700 hover:bg-gray-50 transition-colors border-t border-gray-100 bg-gray-50"
                    >
                      Xem tất cả thông báo
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

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
