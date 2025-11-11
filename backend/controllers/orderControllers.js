const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Comment = require('../models/commentModel');
const User    = require('../models/userModel');  
const sendEmail = require('../utils/sendEmail'); // util của bạn

// Sinh orderId: OD-YYYYMMDD-XXXX
async function genOrderId() {
  const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'');
  for (let i=0;i<5;i++){
    const code = `OD-${ymd}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const exists = await Order.exists({ orderId: code });
    if (!exists) return code;
  }
  return `OD-${ymd}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function buildOrderEmailHTML(order) {
  const currency = n => (Number(n)||0).toLocaleString('vi-VN') + ' ₫';
  const rows = (order.items || []).map(i => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd">${i.name}</td>
      <td style="padding:8px;border:1px solid #ddd" align="right">${currency(i.price)}</td>
      <td style="padding:8px;border:1px solid #ddd" align="center">${i.quantity}</td>
      <td style="padding:8px;border:1px solid #ddd" align="right">${currency(i.price * i.quantity)}</td>
    </tr>`).join('');

  return `
    <div style="font-family:Arial,sans-serif">
      <h2>Đặt hàng thành công — ${order.orderId}</h2>
      <p>Chào ${order.guestInfo?.name || 'bạn'}, cảm ơn bạn đã đặt hàng.</p>
      <table style="border-collapse:collapse;border:1px solid #ddd;width:100%">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #ddd" align="left">Sản phẩm</th>
            <th style="padding:8px;border:1px solid #ddd" align="right">Đơn giá</th>
            <th style="padding:8px;border:1px solid #ddd" align="center">SL</th>
            <th style="padding:8px;border:1px solid #ddd" align="right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;margin-top:12px">
        Tạm tính: <b>${currency(order.subTotal)}</b><br/>
        Thuế: <b>${currency(order.tax)}</b><br/>
        Phí vận chuyển: <b>${currency(order.shippingPrice)}</b><br/>
        Giảm giá: <b>${currency(order.discount?.amount || 0)}</b><br/>
        <span style="font-size:18px">Tổng cộng: <b>${currency(order.totalPrice)}</b></span>
      </p>
      <p><b>Giao tới:</b> ${order.shippingAddress?.recipientName} — ${order.shippingAddress?.phoneNumber}<br/>
         ${order.shippingAddress?.street}, ${order.shippingAddress?.city}</p>
      <p>Phương thức thanh toán: ${String(order.paymentMethod||'').toUpperCase()}</p>
    </div>
  `;
}

// #21: tạo đơn, trừ tồn, (tùy chọn) trừ điểm và gửi email xác nhận
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
        accountId,
        guestInfo,
        items = [],
        shippingAddress,
        paymentMethod,
        shippingPrice = 0,
        tax = 0,
        discount = {},            // { code, percent, amount }
        pointsToRedeem = 0        // số điểm muốn dùng (user đã đăng nhập)
      } = req.body;

      // Validate cơ bản
      if (!paymentMethod) throw new Error('Thiếu paymentMethod.');
      if (!shippingAddress?.recipientName || !shippingAddress?.phoneNumber || !shippingAddress?.street || !shippingAddress?.city) {
        throw new Error('Thiếu thông tin địa chỉ.');
      }
      if (!Array.isArray(items) || items.length === 0) throw new Error('Giỏ hàng trống.');

      // Tải products theo _id hoặc productId string
      const rawIds = [...new Set(items.map(l => l.productId))];
      const mongoIds = rawIds.filter(id => mongoose.isValidObjectId(id));
      const customIds = rawIds.filter(id => !mongoose.isValidObjectId(id));
      const or = [];
      if (mongoIds.length) or.push({ _id: { $in: mongoIds } });
      if (customIds.length) or.push({ productId: { $in: customIds } });

      const findOpts = useTxn ? { session } : {};
      const products = await Product.find(or.length ? { $or: or } : {}, null, findOpts);
      if (!products.length) throw new Error('Không tìm thấy sản phẩm.');

      // Build orderItems & trừ tồn theo biến thể
      const orderItems = [];
      for (const line of items) {
        const p = products.find(x => String(x._id) === String(line.productId) || x.productId === line.productId);
        if (!p) throw new Error(`Không tìm thấy sản phẩm: ${line.productId}`);

        const v = (p.variants || []).find(vv => String(vv.variantId) === String(line.variantId));
        if (!v) throw new Error(`Không tìm thấy biến thể: ${line.variantId} của ${p.productName}`);

        const qty = Math.max(1, Number(line.quantity || line.qty || 1));
        if (v.stock < qty) throw new Error(`Biến thể "${v.name}" của ${p.productName} không đủ tồn (còn ${v.stock}).`);

        v.stock -= qty; // trừ tồn ngay trên doc

        orderItems.push({
          productId: p._id,
          variantId: v.variantId,
          name: `${p.productName} - ${v.name}`,
          price: Number(v.price),
          quantity: qty
        });
      }

      // Lưu thay đổi tồn kho
      for (const p of products) {
        await p.save(findOpts);
      }

      // Tính tiền
      const subTotal = orderItems.reduce((s,i)=> s + i.price * i.quantity, 0);
      const ship   = Number(shippingPrice || 0);
      const taxVal = Number(tax || 0);

      const discPercent       = Number(discount?.percent || 0);
      const discAmountInput   = Number(discount?.amount  || 0);
      const discAmountFromPct = discPercent > 0 ? Math.floor(subTotal * discPercent / 100) : 0;

      let discAmount   = Math.max(discAmountInput, discAmountFromPct);
      let discountCode = discount?.code || undefined;

      // Dùng điểm (chỉ khi có user)
      let pointsUsed = 0;
      let pointsDiscount = 0;
      if (req.user?.id && Number(pointsToRedeem) > 0) {
        const user = await User.findById(req.user.id, null, findOpts);
        if (!user) throw new Error('Không tìm thấy người dùng để trừ điểm.');

        const POINT_VALUE = 1000; // 1 điểm = 1.000đ (đổi nếu cần)
        const want = Math.max(0, Number(pointsToRedeem));
        if (user.loyaltyPoints < want) throw new Error(`Bạn chỉ có ${user.loyaltyPoints} điểm, không đủ ${want} điểm.`);

        const beforeDiscountTotal = subTotal + ship + taxVal;
        const remaining = Math.max(0, beforeDiscountTotal - discAmount);

        pointsDiscount = Math.min(remaining, want * POINT_VALUE);
        pointsUsed = Math.floor(pointsDiscount / POINT_VALUE);

        if (pointsUsed > 0) {
          user.loyaltyPoints -= pointsUsed;
          await user.save(findOpts);
          discAmount += pointsDiscount;
          discountCode = [discountCode, 'POINTS'].filter(Boolean).join('+');
        }
      }

      const totalPrice = Math.max(0, subTotal + ship + taxVal - discAmount);

      // Tạo orderId ngẫu nhiên dạng OD-YYYYMMDD-XXXX
      const orderId = await (async () => {
        const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'');
        for (let i=0;i<5;i++){
          const code = `OD-${ymd}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
          const exists = await Order.exists({ orderId: code });
          if (!exists) return code;
        }
        return `OD-${ymd}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      })();

      const payload = {
        orderId,
        accountId: accountId || req.user?.id,
        guestInfo: guestInfo || {},
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subTotal,
        shippingPrice: ship,
        tax: taxVal,
        discount: {
          code: discountCode,
          percent: discPercent || undefined,
          amount: discAmount || 0
        },
        totalPrice,
        status: 'Pending',
        statusHistory: [{ status: 'Pending', updatedAt: new Date() }],
        isPaid: false
      };

      const createOpts = useTxn ? { session } : {};
      const [created] = await Order.create([payload], createOpts);

      if (useTxn) {
        await session.commitTransaction();
        session.endSession();
      }

      // Gửi email xác nhận (không chặn flow nếu lỗi)
      try {
        const to = payload.guestInfo?.email || req.user?.email;
        if (to) {
          const currency = n => (Number(n)||0).toLocaleString('vi-VN') + ' ₫';
          const rows = (payload.items || []).map(i => `
            <tr>
              <td style="padding:8px;border:1px solid #ddd">${i.name}</td>
              <td style="padding:8px;border:1px solid #ddd" align="right">${currency(i.price)}</td>
              <td style="padding:8px;border:1px solid #ddd" align="center">${i.quantity}</td>
              <td style="padding:8px;border:1px solid #ddd" align="right">${currency(i.price * i.quantity)}</td>
            </tr>`).join('');

          await sendEmail({
            to,
            subject: `Xác nhận đơn hàng ${created.orderId}`,
            html: `
              <div style="font-family:Arial,sans-serif">
                <h2>Đặt hàng thành công — ${created.orderId}</h2>
                <table style="border-collapse:collapse;border:1px solid #ddd;width:100%">
                  <thead>
                    <tr>
                      <th style="padding:8px;border:1px solid #ddd" align="left">Sản phẩm</th>
                      <th style="padding:8px;border:1px solid #ddd" align="right">Đơn giá</th>
                      <th style="padding:8px;border:1px solid #ddd" align="center">SL</th>
                      <th style="padding:8px;border:1px solid #ddd" align="right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
                <div style="margin-top:12px;text-align:right">
                  <div>Tạm tính: <b>${currency(payload.subTotal)}</b></div>
                  <div>Thuế: <b>${currency(payload.tax)}</b></div>
                  <div>Phí vận chuyển: <b>${currency(payload.shippingPrice)}</b></div>
                  <div>Giảm giá (gồm điểm nếu có): <b>${currency(payload.discount?.amount || 0)}</b></div>
                  <div style="font-size:18px;margin-top:6px">Tổng cộng: <b>${currency(payload.totalPrice)}</b></div>
                </div>
              </div>`
          });
        }
      } catch (e) { console.warn('Gửi email thất bại:', e.message); }

      return res.status(201).json({ success:true, order: created });

    } catch (e) {
      if (useTxn && session) { try { await session.abortTransaction(); } catch {} session.endSession(); }
      throw e;
    }
  }

  try {
    if (ENV_FORCE_NO_TXN) return await runCreate(false);
    return await runCreate(true);
  } catch (e) {
    if (/Transaction numbers are only allowed on a replica set member or mongos/i.test(e.message)) {
      console.warn('No replica set → fallback no-transaction');
      try { return await runCreate(false); }
      catch (e2) { return res.status(400).json({ success:false, message: e2.message }); }
    }
    return res.status(400).json({ success:false, message: e.message });
  }
};


// #29: Admin list (phân trang + filter)
exports.listOrders = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const { status, email, from, to } = req.query;

    const match = {};
    if (status) match.status = status; // 'Pending' | 'Confirmed' | ...
    if (email)  match['guestInfo.email'] = new RegExp(`^${email}$`, 'i');
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to)   match.createdAt.$lte = new Date(to);
    }

    const [agg] = await Order.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: {
              orderId:1, createdAt:1, status:1, isPaid:1,
              totalPrice:1, paymentMethod:1,
              'guestInfo.name':1, 'guestInfo.email':1
            } }
          ],
          total: [{ $count: 'count' }]
        }
      }
    ]);

    const total = agg?.total?.[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      success:true,
      orders: agg.items,
      totalOrders: total,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (e) {
    return res.status(500).json({ success:false, message:'Lỗi server', error: e.message });
  }
};

// User xem đơn của mình (tùy chọn)
exports.listMyOrders = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
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
    return res.json({ success:true, orders, currentPage: page, totalPages, totalOrders: total });
  } catch (e) {
    return res.status(500).json({ success:false, message:'Lỗi server', error: e.message });
  }
};

// Chi tiết đơn — chỉ owner hoặc admin
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const o = await Order.findOne({ orderId });
    if (!o) return res.status(404).json({ success:false, message:'Không tìm thấy đơn hàng' });

    const isAdmin = !!req.user?.isAdmin;
    const isOwner = o.accountId && req.user?.id && String(o.accountId) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success:false, message:'Bạn không có quyền xem đơn này' });
    }
    return res.json({ success:true, order: o });
  } catch (e) {
    return res.status(500).json({ success:false, message:'Lỗi server', error:e.message });
  }
};

// Update trạng thái/isPaid — Admin (atomic, chống cộng điểm trùng)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, isPaid } = req.body;

    const allowed = ['Pending','Confirmed','Shipping','Delivered','Cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success:false, message:'Trạng thái không hợp lệ' });
    }

    const $set = {};
    if (typeof isPaid === 'boolean') $set.isPaid = isPaid;
    if (status) $set.status = status;

    const pushHistory = { statusHistory: { status: status || 'Updated', updatedAt: new Date() } };

    let updatedOrder = null;
    let justDelivered = false;

    if (status === 'Delivered') {
      const res1 = await Order.updateOne(
        { orderId, status: { $ne: 'Delivered' } },
        { ...(Object.keys($set).length ? { $set } : {}), $push: pushHistory }
      );

      if (res1.modifiedCount === 0) {
        // Không đổi status (đã Delivered trước đó) → vẫn có thể set isPaid nếu chỉ đổi isPaid
        if (typeof isPaid === 'boolean' && !status) {
          await Order.updateOne({ orderId }, { $set: { isPaid } });
        }
      } else {
        justDelivered = true; // chuyển sang Delivered lần đầu
      }
      updatedOrder = await Order.findOne({ orderId });

    } else if (status) {
      updatedOrder = await Order.findOneAndUpdate(
        { orderId },
        { $set, $push: pushHistory },
        { new: true }
      );
    } else if (typeof isPaid === 'boolean') {
      updatedOrder = await Order.findOneAndUpdate(
        { orderId },
        { $set },
        { new: true }
      );
    } else {
      return res.status(400).json({ success:false, message:'Không có gì để cập nhật' });
    }

    if (!updatedOrder) {
      return res.status(404).json({ success:false, message:'Không tìm thấy đơn hàng' });
    }

    // Cộng điểm nếu vừa Delivered lần đầu
    let userHasBeenUpdated = false;
    if (justDelivered && updatedOrder.accountId) {
      const user = await User.findById(updatedOrder.accountId);
      if (user) {
        const pointsEarned = Math.floor((Number(updatedOrder.totalPrice)||0) / 10000); // 10.000đ = 1 điểm
        if (pointsEarned > 0) {
          user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
          await user.save();
          userHasBeenUpdated = true;
        }
      }
    }

    return res.json({
      success: true,
      order: updatedOrder,
      message: userHasBeenUpdated
        ? 'Đã cập nhật đơn hàng và cộng điểm cho user.'
        : 'Đã cập nhật đơn hàng.'
    });

  } catch (e) {
    return res.status(500).json({ success:false, message:'Lỗi server', error: e.message });
  }
};
