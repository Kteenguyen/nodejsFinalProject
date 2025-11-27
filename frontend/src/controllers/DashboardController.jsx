// frontend/src/controllers/DashboardController.jsx
import api from "../services/api";

export const DashboardController = {
    getStats: async (options = {}) => {
        const { period = "year", from, to, status = "ALL" } = options;
        
        console.log('🔍 DashboardController.getStats called with:', { period, from, to, status });
        
        // 1. Logic lấy Advanced Stats
        try {
            const params = { period };
            if (from) params.from = from;
            if (to) params.to = to;
            // Gửi "ALL" để lấy tất cả orders, không chỉ "Delivered"
            params.status = status || "ALL";
            
            console.log('📡 Calling /api/admin/stats/advanced with params:', params);
            
            const response = await api.get('/api/admin/stats/advanced', { params });
            const data = response.data;
            
            console.log('✅ Backend response:', data);
            
            // Transform backend response sang frontend format
            const totalOrders = data?.kpis?.orders || 0;
            const totalRevenue = data?.kpis?.revenue || 0;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            
            // Transform chartData từ series
            const revenueProfit = data?.series?.revenueProfit || [];
            const ordersQty = data?.series?.ordersQty || [];
            
            // Merge revenue và orders data thành một chart
            const chartData = revenueProfit.map((item, idx) => ({
              name: item.label || `Kỳ ${idx + 1}`,
              DoanhThu: item.revenue || 0,
              DonHang: ordersQty[idx]?.orders || 0
            }));
            
            console.log('Dashboard Stats:', { totalOrders, totalRevenue, avgOrderValue, chartDataLength: chartData.length });
            
            return { 
              success: true, 
              data: {
                totalOrders,
                totalRevenue,
                avgOrderValue,
                chartData
              }
            };

        } catch (error) {
            console.warn("❌ Advanced stats API failed, trying fallback...", error.message);

            // 2. Logic Fallback - Lấy từ /orders/admin/all
            try {
                console.log('📡 Calling fallback /orders/admin/all');
                const resOrder = await api.get('/orders/admin/all');
                let orders = Array.isArray(resOrder.data?.orders) ? resOrder.data.orders : [];
                
                console.log('✅ Fallback orders (before filter):', orders.length, 'orders found');
                
                // Tính date range dựa trên period
                const now = new Date();
                let startDate = null;
                
                if (period === 'month') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (period === 'quarter') {
                    const quarter = Math.floor(now.getMonth() / 3);
                    startDate = new Date(now.getFullYear(), quarter * 3, 1);
                } else if (period === 'week') {
                    const dayOfWeek = now.getDay();
                    const diff = now.getDate() - dayOfWeek;
                    startDate = new Date(now.setDate(diff));
                } else if (period === 'custom' && from && to) {
                    startDate = new Date(from);
                    endDate = new Date(to);
                } else if (period === 'year') {
                    startDate = new Date(now.getFullYear(), 0, 1);
                }
                
                // Filter orders by period
                if (startDate) {
                    const endDate = to ? new Date(to) : new Date();
                    orders = orders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= startDate && orderDate <= endDate;
                    });
                    console.log('📊 After period filter:', orders.length, 'orders found for period:', period);
                }
                
                const totalOrders = orders.length;
                // Tính doanh thu từ tất cả orders (không lọc status)
                const totalRevenue = orders.reduce((sum, o) => {
                    // Thử nhiều field name có thể trả về
                    const amount = o.totalAmount || o.totalPrice || o.total || 0;
                    return sum + (Number(amount) || 0);
                }, 0);
                const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                // Tạo chart data từ orders (group by month)
                const chartData = {};
                orders.forEach(order => {
                    const date = new Date(order.createdAt);
                    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!chartData[month]) {
                        chartData[month] = { name: month, DoanhThu: 0, DonHang: 0 };
                    }
                    chartData[month].DoanhThu += Number(order.totalAmount || order.totalPrice || 0);
                    chartData[month].DonHang += 1;
                });

                const chartDataArray = Object.values(chartData).sort((a, b) => a.name.localeCompare(b.name));
                
                console.log('Fallback Stats:', { totalOrders, totalRevenue, avgOrderValue, chartDataLength: chartDataArray.length });

                return { 
                    success: true, 
                    data: { 
                        totalOrders,
                        totalRevenue,
                        avgOrderValue,
                        chartData: chartDataArray
                    }, 
                    isFallback: true 
                };
            } catch (fallbackError) {
                console.error('❌ Fallback error:', fallbackError);
                return { 
                    success: false, 
                    data: {
                        totalOrders: 0,
                        totalRevenue: 0,
                        avgOrderValue: 0,
                        chartData: []
                    },
                    message: "Không thể tải dữ liệu thống kê." 
                };
            }
        }
    }
};