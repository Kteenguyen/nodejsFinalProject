import { useState, useEffect } from 'react';
import { Bell, Package, Users, ShoppingCart, TrendingUp, X, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { OrderController } from '../controllers/OrderController';
import { UserController } from '../controllers/userController';
import { ProductController } from '../controllers/productController';
import { useNavigate } from 'react-router-dom';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, orders, users, products
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const allNotifications = [];

            // 1. Lấy thông báo từ đơn hàng
            const orders = await OrderController.getAllOrdersForAdmin();
            const orderNotifications = orders.map(order => ({
                id: `order-${order._id}`,
                type: 'order',
                title: getOrderTitle(order.status),
                message: `Đơn hàng #${order._id.slice(-6)} - ${order.user?.name || 'Khách hàng'} - ${formatPrice(order.totalPrice)}`,
                status: order.status,
                time: new Date(order.createdAt),
                isRead: false,
                data: order
            }));
            allNotifications.push(...orderNotifications);

            // 2. Lấy thông báo từ người dùng mới
            const usersData = await UserController.getUsers({ page: 1, limit: 50 });
            const users = usersData.users || usersData.data || [];
            
            // Người dùng đăng ký trong 7 ngày qua
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const newUserNotifications = users
                .filter(user => new Date(user.createdAt) > sevenDaysAgo)
                .map(user => ({
                    id: `user-${user._id}`,
                    type: 'user',
                    title: '👤 Người dùng mới đăng ký',
                    message: `${user.name || user.userName} (${user.email}) đã tạo tài khoản`,
                    time: new Date(user.createdAt),
                    isRead: false,
                    data: user
                }));
            allNotifications.push(...newUserNotifications);

            // 3. Lấy thông báo từ sản phẩm (sắp hết hàng)
            const productsData = await ProductController.getProducts({ limit: 1000 });
            const products = productsData.products || productsData.data || [];
            
            const lowStockNotifications = products
                .filter(product => product.stock > 0 && product.stock < 10)
                .map(product => ({
                    id: `product-low-${product._id}`,
                    type: 'product',
                    title: '⚠️ Sản phẩm sắp hết hàng',
                    message: `${product.name} - Còn ${product.stock} sản phẩm`,
                    time: new Date(), // Thời gian hiện tại
                    isRead: false,
                    status: `Còn ${product.stock}`,
                    data: product
                }));
            allNotifications.push(...lowStockNotifications);

            // Sản phẩm hết hàng
            const outOfStockNotifications = products
                .filter(product => product.stock === 0)
                .map(product => ({
                    id: `product-out-${product._id}`,
                    type: 'product',
                    title: '🚫 Sản phẩm hết hàng',
                    message: `${product.name} - Cần nhập thêm hàng`,
                    time: new Date(),
                    isRead: false,
                    status: 'Hết hàng',
                    data: product
                }));
            allNotifications.push(...outOfStockNotifications);

            // Sắp xếp theo thời gian mới nhất
            allNotifications.sort((a, b) => b.time - a.time);

            setNotifications(allNotifications);
        } catch (error) {
            console.error('Lỗi khi tải thông báo:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOrderTitle = (status) => {
        const titles = {
            'Pending': '🔔 Đơn hàng mới',
            'Confirmed': '✅ Đơn hàng đã xác nhận',
            'Shipping': '🚚 Đang giao hàng',
            'Delivered': '📦 Đã giao hàng',
            'Cancelled': '❌ Đơn hàng đã hủy'
        };
        return titles[status] || '📋 Cập nhật đơn hàng';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return <Package className="w-5 h-5" />;
            case 'user': return <Users className="w-5 h-5" />;
            case 'product': return <ShoppingCart className="w-5 h-5" />;
            case 'system': return <TrendingUp className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Shipping': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'Hết hàng': return 'bg-red-100 text-red-700 border-red-200';
            default: 
                // Xử lý trạng thái "Còn X"
                if (status && status.startsWith('Còn')) {
                    const stock = parseInt(status.match(/\d+/)?.[0] || '0');
                    if (stock < 5) return 'bg-red-100 text-red-700 border-red-200';
                    if (stock < 10) return 'bg-orange-100 text-orange-700 border-orange-200';
                }
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'order') return notif.type === 'order';
        if (filter === 'user') return notif.type === 'user';
        if (filter === 'product') return notif.type === 'product';
        return true;
    });

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const handleViewDetail = (notif) => {
        // Đánh dấu đã đọc trước khi chuyển trang
        markAsRead(notif.id);

        // Chuyển đến trang chi tiết thông báo
        const entityId = notif.data._id;
        navigate(`/admin/notifications/${notif.type}/${entityId}`);
    };

    const getActionButton = (notif) => {
        switch (notif.type) {
            case 'order':
                return {
                    label: 'Xem đơn hàng',
                    color: 'bg-blue-500 hover:bg-blue-600',
                };
            case 'user':
                return {
                    label: 'Xem người dùng',
                    color: 'bg-green-500 hover:bg-green-600',
                };
            case 'product':
                if (notif.data.stock === 0) {
                    return {
                        label: 'Nhập hàng',
                        color: 'bg-red-500 hover:bg-red-600',
                    };
                } else {
                    return {
                        label: 'Cập nhật',
                        color: 'bg-orange-500 hover:bg-orange-600',
                    };
                }
            default:
                return {
                    label: 'Xem chi tiết',
                    color: 'bg-gray-500 hover:bg-gray-600',
                };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                            <p className="text-sm text-gray-500">
                                {unreadCount > 0 
                                    ? `Bạn có ${unreadCount} thông báo chưa đọc` 
                                    : 'Tất cả thông báo đã được đọc'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'Tất cả', icon: Bell },
                    { value: 'order', label: 'Đơn hàng', icon: Package },
                    { value: 'user', label: 'Người dùng', icon: Users },
                    { value: 'product', label: 'Sản phẩm', icon: ShoppingCart },
                ].map(({ value, label, icon: Icon }) => {
                    const count = value === 'all' 
                        ? unreadCount 
                        : notifications.filter(n => !n.isRead && n.type === value).length;
                    
                    return (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                                filter === value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {count > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có thông báo nào</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                                notif.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
                            }`}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`p-3 rounded-lg ${
                                        notif.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {getNotificationIcon(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800">
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
                                                    >
                                                        Đánh dấu đã đọc
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{notif.message}</p>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(notif.time)}
                                                </span>
                                                {notif.status && (
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(notif.status)}`}>
                                                        {notif.status}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleViewDetail(notif)}
                                                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all text-sm font-medium ${getActionButton(notif).color}`}
                                            >
                                                {getActionButton(notif).label}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
