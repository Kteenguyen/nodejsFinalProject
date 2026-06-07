const axios = require('axios');
const https = require('https');

// Thiết lập axios agent để bỏ qua cảnh báo chứng chỉ SSL self-signed của localhost
const agent = new https.Agent({  
  rejectUnauthorized: false
});

const API_BASE = 'https://localhost:3001/api';

async function runTests() {
  console.log('⚡ KHỞI CHẠY KIỂM THỬ API TỰ ĐỘNG (LOCAL TEST) ⚡\n');
  let testCount = 0;
  let passCount = 0;
  let globalProducts = [];

  // Test 1: Health Check
  try {
    testCount++;
    console.log('Test 1: Kiểm tra trạng thái máy chủ (Health Check)...');
    const res = await axios.get(`${API_BASE}/health`, { httpsAgent: agent });
    if (res.status === 200 && res.data.status === 'ok') {
      console.log('✅ Health Check: ĐẠT! Message:', res.data.message);
      passCount++;
    } else {
      console.log('❌ Health Check: THẤT BẠI!');
    }
  } catch (err) {
    console.log('❌ Health Check: LỖI KẾT NỐI!', err.message);
  }
  console.log('--------------------------------------------');

  // Test 2: Đăng nhập tài khoản User mẫu
  let userToken = '';
  try {
    testCount++;
    console.log('Test 2: Đăng nhập tài khoản User (user@test.com / user123)...');
    const res = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'user@test.com',
      password: 'user123'
    }, { httpsAgent: agent });
    
    if (res.status === 200 && res.data.success && res.data.token) {
      userToken = res.data.token;
      console.log('✅ Đăng nhập User: ĐẠT! Token thu được:', userToken.substring(0, 15) + '...');
      passCount++;
    } else {
      console.log('❌ Đăng nhập User: THẤT BẠI!', res.data);
    }
  } catch (err) {
    console.log('❌ Đăng nhập User: LỖI!', err.response ? err.response.data : err.message);
  }
  console.log('--------------------------------------------');

  // Test 3: Đăng nhập tài khoản Admin mẫu
  let adminToken = '';
  try {
    testCount++;
    console.log('Test 3: Đăng nhập tài khoản Admin (admin@test.com / admin123)...');
    const res = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'admin@test.com',
      password: 'admin123'
    }, { httpsAgent: agent });
    
    if (res.status === 200 && res.data.success && res.data.token) {
      adminToken = res.data.token;
      console.log('✅ Đăng nhập Admin: ĐẠT! Token thu được:', adminToken.substring(0, 15) + '...');
      passCount++;
    } else {
      console.log('❌ Đăng nhập Admin: THẤT BẠI!', res.data);
    }
  } catch (err) {
    console.log('❌ Đăng nhập Admin: LỖI!', err.response ? err.response.data : err.message);
  }
  console.log('--------------------------------------------');

  // Test 4: Lấy danh sách sản phẩm (Product List)
  try {
    testCount++;
    console.log('Test 4: Lấy danh sách sản phẩm...');
    const res = await axios.get(`${API_BASE}/products`, { httpsAgent: agent });
    
    // Kiểm tra cấu trúc dữ liệu trả về
    const products = Array.isArray(res.data) ? res.data : (res.data.products || []);
    if (res.status === 200 && products.length > 0) {
      globalProducts = products;
      products.forEach(p => {
        console.log(`   - [${p.brand}] ${p.productName}: Price ${p.lowestPrice ? p.lowestPrice.toLocaleString() : 'N/A'}đ`);
      });
      passCount++;
    } else {
      console.log('❌ Lấy sản phẩm: THẤT BẠI! Không tìm thấy sản phẩm.');
    }
  } catch (err) {
    console.log('❌ Lấy sản phẩm: LỖI!', err.response ? err.response.data : err.message);
  }
  console.log('--------------------------------------------');

  // Test 5: Tạo đơn hàng (Mua hàng & Thanh toán COD)
  try {
    testCount++;
    console.log('Test 5: Tạo đơn hàng mới (Mua hàng & Thanh toán COD)...');
    if (!userToken) {
      console.log('❌ Tạo đơn hàng: THẤT BẠI! Không có token của User.');
    } else if (globalProducts.length === 0) {
      console.log('❌ Tạo đơn hàng: THẤT BẠI! Không có sản phẩm nào để đặt.');
    } else {
      const targetProduct = globalProducts[0];
      const targetVariant = targetProduct.variants && targetProduct.variants[0] ? targetProduct.variants[0] : { variantId: 'var001', price: targetProduct.minPrice || 29990000, name: 'Phiên bản 1' };
      
      const orderPayload = {
        guestInfo: { email: 'user@test.com', name: 'User Test' },
        items: [
          {
            productId: targetProduct._id,
            variantId: targetVariant.variantId,
            price: targetVariant.price,
            quantity: 1,
            name: targetProduct.productName,
            variantName: targetVariant.name
          }
        ],
        shippingAddress: {
          recipientName: 'User Test',
          phoneNumber: '0987654321',
          street: '456 User Street',
          ward: 'Phường Bình An',
          district: 'Quận 2',
          city: 'Hồ Chí Minh'
        },
        paymentMethod: 'COD',
        shippingPrice: 30000,
        tax: 0,
        discount: {}
      };

      const res = await axios.post(`${API_BASE}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${userToken}` },
        httpsAgent: agent
      });

      if (res.status === 201 && res.data.success && res.data.order) {
        console.log(`✅ Tạo đơn hàng: ĐẠT! Đơn hàng #${res.data.order.orderId} đã được tạo thành công.`);
        console.log(`   - Tổng số tiền cần thanh toán: ${res.data.order.totalPrice ? res.data.order.totalPrice.toLocaleString() : 'N/A'}đ`);
        console.log(`   - Tích lũy điểm thưởng: ${res.data.loyalty && res.data.loyalty.pointsEarned ? res.data.loyalty.pointsEarned : 0} điểm.`);
        passCount++;
      } else {
        console.log('❌ Tạo đơn hàng: THẤT BẠI!', res.data);
      }
    }
  } catch (err) {
    console.log('❌ Tạo đơn hàng: LỖI!', err.response ? err.response.data : err.message);
  }
  console.log('--------------------------------------------');

  // Tổng hợp kết quả
  console.log(`📊 KẾT QUẢ KIỂM THỬ: Đạt ${passCount}/${testCount} bài test.`);
  if (passCount === testCount) {
    console.log('🎉 TOÀN BỘ CÁC CỔNG API KẾT NỐI VÀ VẬN HÀNH THÀNH CÔNG! 🚀');
  } else {
    console.log('⚠️ CÓ BÀI TEST CHƯA ĐẠT. VUI LÒNG KIỂM TRA LẠI SERVER.');
  }
}

runTests();
