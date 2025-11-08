const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
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

// #21: tạo đơn, trừ tồn, gửi email xác nhận
exports.createOrder = async (req, res) => {
  // Cho phép ép tắt transaction qua ENV (mặc định: AUTO)
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
        discount = {}
      } = req.body;

      if (!paymentMethod) throw new Error('Thiếu paymentMethod.');
      if (!shippingAddress?.recipientName || !shippingAddress?.phoneNumber || !shippingAddress?.street || !shippingAddress?.city) {
        throw new Error('Thiếu thông tin địa chỉ.');
      }
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Giỏ hàng trống.');
      }

      // Tìm products theo _id hoặc productId string
      const rawIds = [...new Set(items.map(l => l.productId))];
      const mongoIds = rawIds.filter(id => mongoose.isValidObjectId(id));
      const customIds = rawIds.filter(id => !mongoose.isValidObjectId(id));
      const or = [];
      if (mongoIds.length) or.push({ _id: { $in: mongoIds } });
      if (customIds.length) or.push({ productId: { $in: customIds } });

      const findOpts = useTxn ? { session } : {};
      const products = await Product.find(or.length ? { $or: or } : {}, null, findOpts);
      if (!products.length) throw new Error('Không tìm thấy sản phẩm.');

      // Build items + trừ tồn
      const orderItems = [];
      for (const line of items) {
        const p = products.find(x => String(x._id) === String(line.productId) || x.productId === line.productId);
        if (!p) throw new Error(`Không tìm thấy sản phẩm: ${line.productId}`);

        const v = (p.variants || []).find(vv => String(vv.variantId) === String(line.variantId));
        if (!v) throw new Error(`Không tìm thấy biến thể: ${line.variantId} của ${p.productName}`);

        const qty = Math.max(1, Number(line.quantity || line.qty || 1));
        if (v.stock < qty) throw new Error(`Biến thể "${v.name}" của ${p.productName} không đủ tồn.`);

        // trừ tồn tại local doc
        v.stock -= qty;

        orderItems.push({
          productId: p._id,                  // theo orderModel của bạn
          variantId: v.variantId,
          name: `${p.productName} - ${v.name}`,
          price: Number(v.price),
          quantity: qty
        });
      }

      // lưu tồn
      for (const p of products) {
        await p.save(findOpts);
      }

      // tính tiền
      const subTotal = orderItems.reduce((s,i)=> s + i.price * i.quantity, 0);
      const discPercent = Number(discount?.percent || 0);
      const discAmountInput = Number(discount?.amount || 0);
      const discAmountCalc = discPercent > 0 ? Math.floor(subTotal * discPercent / 100) : 0;
      const discAmount = Math.max(discAmountInput, discAmountCalc);
      const ship = Number(shippingPrice || 0);
      const taxVal = Number(tax || 0);
      const totalPrice = Math.max(0, subTotal + ship + taxVal - discAmount);

      const payload = {
        orderId: await (async () => {
          const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'');
          for (let i=0;i<5;i++){
            const code = `OD-${ymd}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
            const exists = await Order.exists({ orderId: code });
            if (!exists) return code;
          }
          return `OD-${ymd}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        })(),
        accountId: accountId || req.user?.id,
        guestInfo: guestInfo || {},
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subTotal,
        shippingPrice: ship,
        tax: taxVal,
        discount: {
          code: discount?.code || undefined,
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

      // gửi mail (không chặn flow nếu lỗi)
      try {
        const to = payload.guestInfo?.email || req.user?.email;
        if (to) {
          await sendEmail({
            to,
            subject: `Xác nhận đơn hàng ${created.orderId}`,
            html: (function buildOrderEmailHTML(order) {
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
                </div>`;
            })(created.toObject ? created.toObject() : created)
          });
        }
      } catch (e) { console.warn('Gửi email thất bại:', e.message); }

      return res.status(201).json({ success:true, order: created });

    } catch (e) {
      if (useTxn && session) {
        try { await session.abortTransaction(); } catch {}
        session.endSession();
      }
      throw e;
    }
  }

  try {
    // AUTO: nếu ENV ép tắt txn thì chạy no-txn luôn
    if (ENV_FORCE_NO_TXN) return await runCreate(false);
    // Thử với transaction
    return await runCreate(true);
  } catch (e) {
    // Nếu lỗi do không có replica set → chạy lại không dùng transaction
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

// Update trạng thái/isPaid — Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, isPaid } = req.body;

    const allowed = ['Pending','Confirmed','Shipping','Delivered','Cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success:false, message:'Trạng thái không hợp lệ' });
    }
    
    const updateDoc = {};
    if (typeof isPaid === 'boolean') updateDoc.isPaid = isPaid;
    if (status) {
      updateDoc.status = status;
      updateDoc.$push = { statusHistory: { status, updatedAt: new Date() } };
      // (tuỳ chọn) rollback tồn nếu Cancelled — có thể bổ sung sau
    }

    const updated = await Order.findOneAndUpdate(
      { orderId },
      Object.keys(updateDoc).length ? updateDoc : {},
      { new: true }
    );
    if (!updated) return res.status(404).json({ success:false, message:'Không tìm thấy đơn hàng' });

    return res.json({ success:true, order: updated });
  } catch (e) {
    return res.status(500).json({ success:false, message:'Lỗi server', error: e.message });
  }
};
