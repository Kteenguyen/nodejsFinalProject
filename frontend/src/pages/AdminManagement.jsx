import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, ShoppingCart, Ticket } from 'lucide-react';
import api from '../services/api';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalUsers: 0,
    activeProducts: 0,
    activeDiscounts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('📊 AdminManagement: Fetching stats...');
        
        // Fetch pending orders count
        try {
          const ordersRes = await api.get('/orders/admin/all?status=Pending');
          console.log('📦 Orders Response:', ordersRes.data);
          const pendingCount = Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders.length : 0;
          
          setStats(prev => ({ ...prev, pendingOrders: pendingCount }));
        } catch (err) {
          console.error('❌ Orders Error:', err.message);
        }

        // Fetch total users count
        try {
          const usersRes = await api.get('/users');
          console.log('👥 Users Response:', usersRes.data);
          const usersCount = usersRes.data?.totalUsers || (Array.isArray(usersRes.data?.users) ? usersRes.data.users.length : 0);
          
          setStats(prev => ({ ...prev, totalUsers: usersCount }));
        } catch (err) {
          console.error('❌ Users Error:', err.message);
        }

        // Fetch products count
        try {
          const productsRes = await api.get('/products');
          console.log('🛍️ Products Response:', productsRes.data);
          const productsCount = productsRes.data?.totalProducts || (Array.isArray(productsRes.data?.products) ? productsRes.data.products.length : 0);
          
          setStats(prev => ({ ...prev, activeProducts: productsCount }));
        } catch (err) {
          console.error('❌ Products Error:', err.message);
        }

        // Fetch discounts count
        try {
          const discountsRes = await api.get('/discounts');
          console.log('🎟️ Discounts Response:', discountsRes.data);
          const discountsCount = Array.isArray(discountsRes.data?.discounts) ? discountsRes.data.discounts.length : 0;
          
          setStats(prev => ({ ...prev, activeDiscounts: discountsCount }));
        } catch (err) {
          console.error('❌ Discounts Error:', err.message);
        }
        
        console.log('✅ Stats fetching completed');
      } catch (error) {
        console.error('❌ Overall error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const managementCards = [
    {
      title: 'Orders',
      description: 'Quản lý đơn hàng, theo dõi trạng thái',
      icon: ClipboardList,
      path: '/admin/orders',
      color: 'bg-blue-500',
    },
    {
      title: 'Users',
      description: 'Quản lý người dùng, tài khoản khách hàng',
      icon: Users,
      path: '/admin/users',
      color: 'bg-green-500',
    },
    {
      title: 'Products',
      description: 'Quản lý sản phẩm, kho hàng, giá cả',
      icon: ShoppingCart,
      path: '/admin/products',
      color: 'bg-purple-500',
    },
    {
      title: 'Discounts',
      description: 'Quản lý mã giảm giá, khuyến mãi',
      icon: Ticket,
      path: '/admin/discounts',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Management Hub</h1>
          <p className="text-gray-600 text-lg">Quản lý toàn bộ hoạt động kinh doanh của bạn</p>
        </div>

        {/* Management Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {managementCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.path)}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Color bar top */}
                <div className={`h-1 ${card.color}`}></div>

                {/* Content */}
                <div className="p-6">
                  <div className={`${card.color} text-white w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{card.description}</p>

                  <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Truy cập
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{loading ? '...' : stats.pendingOrders}</div>
              <p className="text-gray-600">Pending Orders</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{loading ? '...' : stats.activeProducts}</div>
              <p className="text-gray-600">Active Products</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{loading ? '...' : stats.activeDiscounts}</div>
              <p className="text-gray-600">Active Discounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
