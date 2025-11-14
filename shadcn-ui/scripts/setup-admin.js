#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bill_lookup',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function setupAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Đang thiết lập tài khoản Admin...');
    
    // Check if employees table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employees'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('📋 Tạo bảng employees...');
      await client.query(`
        CREATE TABLE employees (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100),
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    // Check if admin already exists
    const adminCheck = await client.query(
      'SELECT id FROM employees WHERE username = $1',
      ['admin']
    );
    
    if (adminCheck.rows.length > 0) {
      console.log('⚠️  Tài khoản admin đã tồn tại, đang cập nhật mật khẩu...');
      
      // Update existing admin password
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        'UPDATE employees SET password_hash = $1, role = $2, full_name = $3, updated_at = CURRENT_TIMESTAMP WHERE username = $4',
        [hashedPassword, 'admin', 'Administrator', 'admin']
      );
      
      console.log('✅ Đã cập nhật tài khoản admin thành công!');
    } else {
      console.log('👤 Tạo tài khoản admin mới...');
      
      // Create new admin account
      const hashedPassword = await bcrypt.hash('123456', 10);
      await client.query(
        'INSERT INTO employees (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'Administrator', 'admin']
      );
      
      console.log('✅ Đã tạo tài khoản admin thành công!');
    }
    
    // Verify admin account
    const verifyAdmin = await client.query(
      'SELECT username, full_name, role, created_at FROM employees WHERE username = $1',
      ['admin']
    );
    
    if (verifyAdmin.rows.length > 0) {
      const admin = verifyAdmin.rows[0];
      console.log('\n📋 Thông tin tài khoản Admin:');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: 123456`);
      console.log(`   Full Name: ${admin.full_name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.created_at}`);
      console.log('\n🎉 Bạn có thể đăng nhập với thông tin trên!');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi thiết lập admin:', error.message);
    
    // Provide manual SQL commands as fallback
    console.log('\n🔧 Nếu script không hoạt động, hãy chạy SQL commands sau:');
    console.log('\n-- Tạo bảng employees (nếu chưa có):');
    console.log(`CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    
    console.log('\n-- Tạo tài khoản admin:');
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log(`INSERT INTO employees (username, password_hash, full_name, role) 
VALUES ('admin', '${hashedPassword}', 'Administrator', 'admin')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = CURRENT_TIMESTAMP;`);
    
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupAdmin().catch(console.error);