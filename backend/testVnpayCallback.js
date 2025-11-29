const crypto = require('crypto');
const querystring = require('qs');

// Giả lập VNPay gửi callback về backend
const secretKey = 'GPCHCZKZNTPZQUEVCXWVYVBIAZMZWTBG';
const orderId = 'ORD-1764419195311-p98af9wzf'; // Order VNPay thật từ DB
const amount = 250000; // Số tiền (VND) - thay bằng số tiền thật của order

// Tạo params giống VNPay
let vnp_Params = {
    vnp_Amount: amount * 100, // VNPay nhân 100
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP14751955',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_PayDate: '20251129193045',
    vnp_ResponseCode: '00', // 00 = Thành công
    vnp_TmnCode: 'CGXXGHZC',
    vnp_TransactionNo: '14751955',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: orderId,
    vnp_SecureHashType: 'SHA512'
};

// Sắp xếp theo alphabet (bắt buộc)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(key);
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = obj[str[key]];
    }
    return sorted;
}

vnp_Params = sortObject(vnp_Params);

// Tạo chữ ký
const signData = querystring.stringify(vnp_Params, { encode: false });
const hmac = crypto.createHmac("sha512", secretKey);
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

vnp_Params['vnp_SecureHash'] = signed;

// Tạo URL callback
const callbackUrl = `http://localhost:3001/api/payment/vnpay_return?${querystring.stringify(vnp_Params)}`;

console.log('📋 Test VNPay Callback URL:\n');
console.log(callbackUrl);
console.log('\n🔗 Copy URL này và paste vào trình duyệt để test callback');
console.log('\n✅ Nếu redirect đến /order-success?code=00 => Thành công!');
