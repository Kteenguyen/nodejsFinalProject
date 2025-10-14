const mongoose = require('mongoose');
const Discount = require('./models/discountModel');
require('dotenv').config(); // Nếu bạn dùng file .env để lưu chuỗi kết nối

const discounts = [
  {
    discountID: "d1b2c3a4-e5f6-7890-1234-567890abcdef",
    discountCode: "WELCOME10",
    discountName: "Mã chào mừng thành viên mới",
    percent: 10,
    maxUses: 10,
    uses: 0
  },
  {
    discountID: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    discountCode: "SALE15",
    discountName: "Giảm giá giữa tháng 10",
    percent: 15,
    maxUses: 8,
    uses: 3
  },
  {
    discountID: "f1e2d3c4-b5a6-9876-5432-10fedcba9876",
    discountCode: "FLASH50",
    discountName: "Flash Sale cuối tuần (đã hết)",
    percent: 50,
    maxUses: 5,
    uses: 5
  },
  {
    discountID: "c9d8e7f6-a5b4-c3d2-e1f0-9a8b7c6d5e4f",
    discountCode: "VIPCODE",
    discountName: "Mã giảm giá độc quyền",
    percent: 25,
    maxUses: 1,
    uses: 0
  },
  {
    discountID: "12345678-abcd-effe-dcba-876543210abc",
    discountCode: "THANKYOU",
    discountName: "Mã tri ân khách hàng",
    percent: 5,
    maxUses: 10,
    uses: 1
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true, // Các option này có thể không cần thiết ở Mongoose v6+
      // useUnifiedTopology: true,
    });

    // Xóa dữ liệu cũ để tránh trùng lặp
    await Discount.deleteMany();

    // Thêm dữ liệu mới
    await Discount.insertMany(discounts);

    console.log('Dữ liệu đã được thêm thành công!');
    process.exit();
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu:', error);
    process.exit(1);
  }
};

importData();