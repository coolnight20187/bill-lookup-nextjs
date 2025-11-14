# Hướng dẫn thiết lập tài khoản Admin

## 🚀 Cách 1: Chạy script tự động (Khuyến nghị)

### Bước 1: Cài đặt dependencies
```bash
cd /workspace/shadcn-ui
npm install pg bcryptjs
```

### Bước 2: Thiết lập biến môi trường
Tạo file `.env.local` với thông tin database:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bill_lookup
DB_USER=postgres
DB_PASSWORD=your_password
```

### Bước 3: Chạy script setup
```bash
node scripts/setup-admin.js
```

## 🔧 Cách 2: Chạy SQL commands thủ công

### Kết nối vào PostgreSQL database và chạy:

```sql
-- Tạo bảng employees (nếu chưa có)
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo tài khoản admin với mật khẩu đã hash
INSERT INTO employees (username, password_hash, full_name, role) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = CURRENT_TIMESTAMP;
```

## 📋 Thông tin đăng nhập

**Username:** `admin`  
**Password:** `123456`  
**Role:** `admin`

## 🔍 Kiểm tra tài khoản

Để kiểm tra tài khoản đã được tạo thành công:

```sql
SELECT username, full_name, role, created_at 
FROM employees 
WHERE username = 'admin';
```

## ⚠️ Troubleshooting

### Lỗi "Cannot connect to database"
1. Kiểm tra PostgreSQL service đang chạy
2. Xác nhận thông tin kết nối database trong `.env.local`
3. Kiểm tra firewall và port 5432

### Lỗi "bcrypt not found"
```bash
npm install bcryptjs
```

### Lỗi "Table doesn't exist"
Chạy lại script hoặc tạo bảng thủ công bằng SQL commands ở trên.

### Vẫn không đăng nhập được
1. Kiểm tra console browser để xem error messages
2. Kiểm tra network tab xem API calls có thành công không
3. Restart ứng dụng sau khi tạo admin account

## 🔐 Bảo mật

**Quan trọng:** Sau khi đăng nhập thành công, hãy đổi mật khẩu admin trong giao diện quản lý để đảm bảo bảo mật!

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, hãy:
1. Kiểm tra logs trong console
2. Chụp screenshot lỗi
3. Cung cấp thông tin về database setup của bạn