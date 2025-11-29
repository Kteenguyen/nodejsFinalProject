// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// Lấy token từ cookie 'jwt' hoặc header Authorization: Bearer <token>
function getTokenFromReq(req) {
  // Ưu tiên cookie HttpOnly
  if (req.cookies && req.cookies.jwt) return req.cookies.jwt;

  // Fallback: Authorization header (Bearer)
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromReq(req);
  
  // Debug log
  console.log('🔐 [AUTH MIDDLEWARE] Checking token...');
  console.log('   Cookie jwt:', req.cookies?.jwt ? 'EXISTS' : 'MISSING');
  console.log('   Authorization header:', req.headers.authorization ? 'EXISTS' : 'MISSING');
  console.log('   Token found:', token ? 'YES' : 'NO');

  if (!token) {
    res.status(401);
    throw new Error('Không được ủy quyền: thiếu token (cookie jwt hoặc Bearer).');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Người dùng không tồn tại hoặc đã bị xóa.');
    }

    req.user = user;        // gắn user cho các route sau
    req.auth = decoded;     // (tuỳ chọn) giữ decoded để debug
    console.log('✅ [AUTH MIDDLEWARE] User authenticated:', user.email);
    next();
  } catch (err) {
    res.status(401);
    console.error('❌ [AUTH MIDDLEWARE] Token error:', err.message);
    // Phân biệt lỗi token hết hạn/không hợp lệ để debug dễ hơn
    if (err?.name === 'TokenExpiredError') {
      throw new Error('Token đã hết hạn.');
    }
    throw new Error('Token không hợp lệ.');
  }
});

// Chấp nhận cả role === 'admin' hoặc isAdmin === true (tuỳ model)
const admin = (req, res, next) => {
  const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin === true;
  if (isAdmin) return next();
  res.status(403);
  throw new Error('Không có quyền Admin.');
};

module.exports = { protect, admin };
