#!/usr/bin/env node

const bcrypt = require('bcryptjs');

async function generateAdminSQL() {
  console.log('🔧 Tạo SQL commands để thiết lập tài khoản Admin...\n');
  
  // Generate hashed password
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  console.log('📋 SQL Commands để tạo tài khoản Admin:');
  console.log('=' .repeat(60));
  
  console.log('\n-- 1. Tạo bảng employees (nếu chưa có):');
  console.log(`CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
  
  console.log('\n-- 2. Tạo/Cập nhật tài khoản admin:');
  console.log(`INSERT INTO employees (username, password_hash, full_name, role) 
VALUES ('admin', '${hashedPassword}', 'Administrator', 'admin')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = CURRENT_TIMESTAMP;`);
  
  console.log('\n-- 3. Kiểm tra tài khoản đã tạo:');
  console.log(`SELECT username, full_name, role, created_at 
FROM employees 
WHERE username = 'admin';`);
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Thông tin đăng nhập:');
  console.log('   Username: admin');
  console.log('   Password: 123456');
  console.log('   Role: admin');
  
  console.log('\n🔍 Hướng dẫn sử dụng:');
  console.log('1. Kết nối vào PostgreSQL database của bạn');
  console.log('2. Copy và paste các SQL commands ở trên');
  console.log('3. Chạy từng command theo thứ tự');
  console.log('4. Đăng nhập vào ứng dụng với username: admin, password: 123456');
  
  console.log('\n⚠️  Lưu ý: Hãy đổi mật khẩu sau khi đăng nhập thành công!');
}

generateAdminSQL().catch(console.error);