// scripts/test-health.js
const { spawn } = require('child_process');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, '..', 'backend');

// Tránh lỗi chứng chỉ tự ký khi test HTTPS trên localhost
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Đọc cổng từ environment hoặc mặc định
const PORT = process.env.PORT || 3001;

// Kiểm tra xem SSL Cert có tồn tại không
const certExists = fs.existsSync(path.join(BACKEND_DIR, 'cert.pem')) && 
                   fs.existsSync(path.join(BACKEND_DIR, 'key.pem'));

const PROTOCOL = certExists ? 'https' : 'http';
const HEALTH_URL = `${PROTOCOL}://localhost:${PORT}/api/health`;

console.log(`🔍 Thử nghiệm Health Check tại: ${HEALTH_URL}`);

// Khởi chạy server ở tiến trình con
const serverProcess = spawn('node', ['server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'development' }
});

let serverOutput = '';
serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log(`[SERVER STDOUT]: ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
    console.error(`[SERVER STDERR]: ${data.toString().trim()}`);
});

let isFinished = false;

const cleanup = (exitCode) => {
    if (isFinished) return;
    isFinished = true;
    console.log('🧹 Đang dừng Backend Server...');
    serverProcess.kill('SIGTERM');
    process.exit(exitCode);
};

// Đợi server khởi chạy trong 3 giây
setTimeout(() => {
    const client = PROTOCOL === 'https' ? https : http;
    
    const request = client.get(HEALTH_URL, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
            try {
                const responseJson = JSON.parse(body);
                console.log('📥 Phản hồi nhận được:', responseJson);
                
                if (res.statusCode === 200 && responseJson.status === 'ok') {
                    console.log('✅ Health check thành công!');
                    cleanup(0);
                } else {
                    console.error(`❌ Health check thất bại: HTTP status ${res.statusCode}`);
                    cleanup(1);
                }
            } catch (err) {
                console.error('❌ Phản hồi không phải JSON hợp lệ:', body);
                cleanup(1);
            }
        });
    });

    request.on('error', (err) => {
        console.error('❌ Không thể kết nối tới server:', err.message);
        cleanup(1);
    });

    request.end();
}, 3000);

// Nếu server tự động thoát trước khi test
serverProcess.on('exit', (code) => {
    if (!isFinished) {
        console.error(`❌ Server đột ngột dừng với mã thoát: ${code}`);
        cleanup(1);
    }
});
