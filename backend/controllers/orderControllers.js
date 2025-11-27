// backend/controllers/orderControllers.js
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('express-async-handler');

// --- HELPERS ---
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function startOfMonth(d) { const x = new Date(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x; }

// --- 1. TẠO ĐƠN HÀNG (GIỮ NGUYÊN) ---
exports.createOrder = async (req, res) => {
  const ENV_FORCE_NO_TXN = String(process.env.USE_TXN || '').toLowerCase() === 'false';

  async function runCreate(useTxn) {
    let session = null;
    if (useTxn) {
      session = await mongoose.startSession();
      session.startTransaction();
    }
    try {
      const {
        accountId, guestInfo, items = [], shippingAddress, paymentMethod,
        shippingPrice = 0, tax = 0, discount = {}, pointsToRedeem = 0
      } = req.body;

      if (!paymentMethod) throw new Error('Thiếu paymentMethod.');
      if (!shippingAddress?.recipientName) throw new Error('Thiếu thông tin địa chỉ.');
      if (!Array.isArray(items) || items.length === 0) throw new Error('Giỏ hàng trống.');

      const rawIds = [...new Set(items.map(l => l.productId))];
      const mongoIds = rawIds.filter(id => mongoose.isValidObjectId(id));
      const customIds = rawIds.filter(id => !mongoose.isValidObjectId(id));
      const or = [];
      if (mongoIds.length) or.push({ _id: { $in: mongoIds } });
      if (customIds.length) or.push({ productId: { $in: customIds } });

      const findOpts = useTxn ? { session } : {};
      const products = await Product.find(or.length ? { $or: or } : {}, null, findOpts);
      if (!products.length) throw new Error('Không tìm thấy sản phẩm.');

      const orderItems = [];
      for (const line of items) {
        const p = products.find(x => String(x._id) === String(line.productId) || x.productId === line.productId);
        if (!p) throw new Error(`Không tìm thấy sản phẩm: ${line.productId}`);

        const v = (p.variants || []).find(vv => String(vv.variantId) === String(line.variantId));
        if (!v) throw new Error(`Không tìm thấy biến thể: ${line.variantId}`);

        const qty = Math.max(1, Number(line.quantity || 1));
        if (v.stock < qty) throw new Error(`Biến thể "${v.name}" không đủ tồn (còn ${v.stock}).`);

        v.stock -= qty;
        orderItems.push({
          productId: p._id, variantId: v.variantId, name: `${p.productName} - ${v.name}`,
          price: Number(v.price), quantity: qty
        });
      }

      for (const p of products) await p.save(findOpts);

      const subTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const ship = Number(shippingPrice || 0);
      const taxVal = Number(tax || 0);

      let discAmount = Number(discount?.amount || 0);
      let discountCode = discount?.code || undefined;

      if (req.user?.id && Number(pointsToRedeem) > 0) {
        const user = await User.findById(req.user.id, null, findOpts);
        if (user && user.loyaltyPoints >= pointsToRedeem) {
          const used = Math.floor(Math.min(pointsToRedeem * 1000, subTotal + ship + taxVal - discAmount) / 1000);
          if (used > 0) {
            user.loyaltyPoints -= used;
            await user.save(findOpts);
            discAmount += used * 1000;
            discountCode = [discountCode, 'POINTS'].filter(Boolean).join('+');
          }
        }
      }

      const totalPrice = Math.max(0, subTotal + ship + taxVal - discAmount);

      // Tạo Order ID
      const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const codeSuffix = Date.now().toString(36).toUpperCase().slice(-6);
      const orderId = `OD-${ymd}-${codeSuffix}`;

      const payload = {
        orderId, accountId: accountId || req.user?.id, guestInfo: guestInfo || {},
        items: orderItems, shippingAddress, paymentMethod,
        subTotal, shippingPrice: ship, tax: taxVal,
        discount: { code: discountCode, amount: discAmount || 0 },
        totalPrice, status: 'Pending', statusHistory: [{ status: 'Pending', updatedAt: new Date() }], isPaid: false
      };

      const createOpts = useTxn ? { session } : {};
      const [created] = await Order.create([payload], createOpts);

      if (useTxn) {
        await session.commitTransaction();
        session.endSession();
      }

      // Gửi mail (bỏ qua nếu lỗi)
      try {
        const to = payload.guestInfo?.email || req.user?.email;
        if (to) {
          await sendEmail({
            to, subject: `Xác nhận đơn hàng ${created.orderId}`,
            html: `<h2>Đặt hàng thành công ${created.orderId}</h2><p>Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} đ</p>`
          });
        }
      } catch (e) { }

      return res.status(201).json({ success: true, order: created });

    } catch (e) {
      if (useTxn && session) { try { await session.abortTransaction(); } catch { } session.endSession(); }
      throw e;
    }
  }

  try {
    if (ENV_FORCE_NO_TXN) return await runCreate(false);
    return await runCreate(true);
  } catch (e) {
    try { return await runCreate(false); } catch (e2) { return res.status(400).json({ success: false, message: e2.message }); }
  }
};

// --- 2. LẤY DANH SÁCH ĐƠN HÀNG ADMIN (ĐÃ LÀM SẠCH) ---
// --- API LẤY DANH SÁCH ĐƠN HÀNG (Admin) ---
exports.listOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    // Lấy tham số từ Frontend (hỗ trợ cả format cũ: date/start/end và mới: from/to)
    let { date, start, end, status, from, to } = req.query;
    
    // Nếu có from/to thì dùng, không thì dùng start/end
    if (!start && from) start = from;
    if (!end && to) end = to;
    
    const now = new Date();
    let filterFrom = null, filterTo = null;

    // LOGIC LỌC NGÀY
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const endOfDay = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

    // Nếu có start/end (custom date range từ frontend)
    if (start && end) {
      filterFrom = startOfDay(new Date(start));
      filterTo = endOfDay(new Date(end));
      console.log('📋 Custom date range filter:', { from: filterFrom, to: filterTo });
    } else {
      // Nếu không có thì dùng date parameter (today, yesterday, week, month)
      switch (date) {
        case 'today':
          filterFrom = startOfDay(now); filterTo = endOfDay(now);
          break;
        case 'yesterday':
          const y = new Date(now); y.setDate(y.getDate() - 1);
          filterFrom = startOfDay(y); filterTo = endOfDay(y);
          break;
        case 'week': 
          const day = now.getDay() || 7; 
          filterFrom = startOfDay(now); 
          filterFrom.setDate(now.getDate() - day + 1); 
          filterTo = endOfDay(now);
          break;
        case 'month':
          filterFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          filterTo = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
          break;
        case 'custom':
          if (start && end) {
            filterFrom = startOfDay(new Date(start));
            filterTo = endOfDay(new Date(end));
          }
          break;
        default: break;
      }
    }

    let filterQuery = {};
    if (filterFrom && filterTo) {
      filterQuery.createdAt = { $gte: filterFrom, $lte: filterTo };
      console.log('📊 Applied date filter:', { from: filterFrom, to: filterTo });
    }
    if (status && status !== 'ALL' && status !== '') filterQuery.status = status;

    console.log('🔍 listOrders - Query:', filterQuery);

    // --- TRUY VẤN DATABASE (KHÔNG DÙNG POPULATE ĐỂ TRÁNH LỖI) ---
    const [orders, totalOrders] = await Promise.all([
      Order.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Trả về object thuần JavaScript giúp nhanh hơn và tránh lỗi cast
      Order.countDocuments(filterQuery)
    ]);

    console.log('✅ Found orders:', orders.length);

    // --- XỬ LÝ DỮ LIỆU THỦ CÔNG ---
    const formattedOrders = orders.map(o => {
        // Tự xử lý tên khách hàng mà không cần populate
        let customerName = "Khách vãng lai";
        let customerEmail = "N/A";

        if (o.guestInfo && o.guestInfo.name) {
            customerName = o.guestInfo.name;
            customerEmail = o.guestInfo.email || "";
        } else if (o.accountId) {
            // Vì không populate được do lỗi ID, ta hiển thị tạm ID hoặc text cố định
            customerName = "Thành viên (ID: " + o.accountId.toString().substring(0, 6) + "...)";
        }

        return {
            _id: o._id,
            orderId: o.orderId,
            createdAt: o.createdAt,
            status: o.status,
            totalPrice: o.totalPrice,
            isPaid: o.isPaid,
            itemsCount: (o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
            customerName,
            customerEmail,
            paymentMethod: o.paymentMethod
        };
    });

    // --- TRẢ VỀ KẾT QUẢ (CẤU TRÚC KHỚP 100% VỚI FRONTEND) ---
    return res.status(200).json({
      success: true,
      orders: formattedOrders, // Frontend dùng biến này
      
      // Frontend AdminOrders.jsx đang tìm biến data.totalOrders hoặc data.total
      totalOrders: totalOrders, 
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      
      // Để tương thích ngược nếu Frontend dùng cấu trúc khác
      pagination: { 
          page, 
          totalPages: Math.ceil(totalOrders / limit), 
          totalOrders 
      }
    });

  } catch (error) {
    console.error("Lỗi listOrders:", error); // Log ra terminal để debug
    return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
  }
};

// --- 3. THỐNG KÊ DASHBOARD (REALTIME) ---
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Nhận thêm tham số 'status'
    const { period = 'year', start, end, status } = req.query;
    
    const now = new Date();
    let startDate = new Date(now.getFullYear(), 0, 1);
    let endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    let groupBy = "month";

    // ... (Giữ nguyên phần xử lý switch case period: year, quarter, month, week...) ...
    switch (period) {
      case 'year': groupBy = "month"; break;
      case 'quarter':
        const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
        startDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        endDate = new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59);
        groupBy = "month";
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        groupBy = "day";
        break;
      case 'week':
        const day = now.getDay() || 7;
        startDate = new Date(now); startDate.setHours(0, 0, 0, 0); startDate.setDate(now.getDate() - day + 1);
        endDate = new Date(now); endDate.setHours(23, 59, 59, 999); endDate.setDate(startDate.getDate() + 6);
        groupBy = "day";
        break;
      case 'custom':
        if (start && end) {
          startDate = new Date(start); endDate = new Date(end); endDate.setHours(23, 59, 59, 999);
          const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
          groupBy = diffDays > 60 ? "month" : "day";
        }
        break;
    }

    // 2. Xử lý điều kiện lọc (Match Stage)
    let matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Logic thông minh:
    // - Nếu người dùng chọn trạng thái cụ thể (ví dụ 'Pending') -> Lọc đúng trạng thái đó.
    // - Nếu chọn 'ALL' hoặc không chọn -> Mặc định loại bỏ đơn 'Cancelled' để tính doanh thu thực.
    if (status && status !== 'ALL') {
      matchQuery.status = status;
    } else {
      matchQuery.status = { $ne: 'Cancelled' };
    }

    const matchStage = matchQuery;

    // 3. Các phần tính toán bên dưới giữ nguyên
    const kpiStats = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: "$totalPrice" } } }
    ]);
    const result = kpiStats.length > 0 ? kpiStats[0] : { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    let groupIdObj = groupBy === "month" ? { $month: "$createdAt" } : { $dayOfMonth: "$createdAt" };
    const chartStats = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: groupIdObj, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);

    // Fill dữ liệu biểu đồ
    let chartData = [];
    if (groupBy === "month") {
      const startM = startDate.getMonth() + 1;
      const endM = endDate.getMonth() + 1; // Lưu ý: nếu khác năm cần logic phức tạp hơn, tạm thời code này chạy tốt cho logic 'Năm nay'
      // Fix nhanh cho trường hợp đơn giản: loop 1-12 nếu xem theo năm
      const loopStart = period === 'year' ? 1 : startM;
      const loopEnd = period === 'year' ? 12 : endM;
      
      for (let i = loopStart; i <= loopEnd; i++) {
        const found = chartStats.find(c => c._id === i);
        chartData.push({ name: `Tháng ${i}`, DoanhThu: found ? found.revenue : 0, DonHang: found ? found.orders : 0 });
      }
    } else {
      // Loop theo ngày
      const loopDate = new Date(startDate);
      while (loopDate <= endDate) {
        const d = loopDate.getDate();
        const found = chartStats.find(c => c._id === d);
        chartData.push({ name: `${d}/${loopDate.getMonth() + 1}`, DoanhThu: found ? found.revenue : 0, DonHang: found ? found.orders : 0 });
        loopDate.setDate(loopDate.getDate() + 1);
      }
    }

    return res.status(200).json({ success: true, ...result, chartData });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Lỗi thống kê", error: err.message });
  }
};

// --- 4. CÁC HÀM KHÁC ---
exports.listMyOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const match = req.user?.id
      ? { accountId: req.user.id }
      : (req.query.email ? { 'guestInfo.email': new RegExp(`^${req.query.email}$`, 'i') } : {});

    const orders = await Order.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('orderId createdAt status isPaid totalPrice guestInfo paymentMethod');

    const total = await Order.countDocuments(match);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({ success: true, orders, currentPage: page, totalPages, totalOrders: total });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const o = await Order.findOne({ orderId });
    
    if (!o) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // --- QUAN TRỌNG: Check quyền linh hoạt (Role hoặc isAdmin) ---
    const isUserAdmin = req.user?.role === 'admin' || req.user?.isAdmin === true;
    const currentUserId = req.user?._id ? String(req.user._id) : null;
    const orderOwnerId = o.accountId ? String(o.accountId) : null;
    const isOwner = orderOwnerId && currentUserId && orderOwnerId === currentUserId;

    if (!isUserAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn này.' });
    }

    return res.json({ success: true, order: o });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, isPaid } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
    if (status && !allowed.includes(status)) return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });

    const $set = {};
    if (typeof isPaid === 'boolean') $set.isPaid = isPaid;
    if (status) $set.status = status;
    const pushHistory = { statusHistory: { status: status || 'Updated', updatedAt: new Date() } };

    let updatedOrder = null;
    let justDelivered = false;

    if (status === 'Delivered') {
      const res1 = await Order.updateOne({ orderId, status: { $ne: 'Delivered' } }, { ...(Object.keys($set).length ? { $set } : {}), $push: pushHistory });
      if (res1.modifiedCount > 0) justDelivered = true;
      else if (typeof isPaid === 'boolean' && !status) await Order.updateOne({ orderId }, { $set: { isPaid } });
      updatedOrder = await Order.findOne({ orderId });
    } else if (status || typeof isPaid === 'boolean') {
      updatedOrder = await Order.findOneAndUpdate({ orderId }, { $set, $push: pushHistory }, { new: true });
    }

    if (!updatedOrder) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (justDelivered && updatedOrder.accountId) {
      const user = await User.findById(updatedOrder.accountId);
      if (user) {
        user.loyaltyPoints = (user.loyaltyPoints || 0) + Math.floor((Number(updatedOrder.totalPrice) || 0) / 10000);
        await user.save();
      }
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

exports.getOrdersByUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const orders = await Order.find({ accountId: userId }).sort({ createdAt: -1 });
  if (orders) res.status(200).json(orders);
  else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});