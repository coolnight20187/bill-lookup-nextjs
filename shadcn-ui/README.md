# Bill Lookup System - Next.js 14

Hệ thống tra cứu và quản lý hóa đơn điện hiện đại được xây dựng với Next.js 14, TypeScript, Supabase và Tailwind CSS.

## ✨ Tính năng

- 🔐 **Xác thực**: Đăng nhập bảo mật với Supabase Auth
- 📊 **Tra cứu hóa đơn**: Truy vấn hóa đơn điện từ 2 cổng API
- 👥 **Quản lý nhân viên**: Admin có thể quản lý nhân viên với phân quyền
- 🏪 **Quản lý khách hàng**: Quản lý khách hàng thẻ (KHT)
- 📦 **Hệ thống kho**: Nhập/xuất quản lý hóa đơn
- 📈 **Lịch sử giao dịch**: Theo dõi tất cả giao dịch bán hàng
- 📝 **Ghi chú công việc**: Hệ thống ghi chú cho nhân viên
- 🌙 **Dark Mode**: Hỗ trợ đầy đủ theme sáng/tối
- 📱 **Responsive**: Thiết kế responsive mobile-first

## 🛠️ Công nghệ

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth với RLS
- **Deployment**: Netlify (khuyến nghị)

## 🚀 Bắt đầu

### Yêu cầu

- Node.js 18+ 
- pnpm hoặc npm
- Tài khoản Supabase

### Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd bill-lookup-nextjs
```

2. Cài đặt dependencies:
```bash
pnpm install
```

3. Thiết lập biến môi trường:
```bash
cp .env.example .env.local
```

Điền thông tin Supabase và API credentials vào `.env.local`.

4. Thiết lập Supabase database:
   - Tạo project Supabase mới
   - Chạy các SQL scripts theo thứ tự:
     - `/workspace/supabase_schema.sql`
     - `/workspace/supabase_rls_policies.sql`
     - `/workspace/supabase_auth_setup.sql`

5. Chạy development server:
```bash
pnpm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### Đăng nhập mặc định

- **Username**: admin
- **Password**: 123456

## 📊 Database Schema

Hệ thống sử dụng các bảng chính:

- `employees` - Quản lý nhân viên với phân quyền
- `members` - Khách hàng thẻ (KHT)
- `warehouse` - Hệ thống lưu trữ hóa đơn
- `transaction_history` - Lịch sử giao dịch bán hàng
- `work_notes` - Ghi chú công việc nhân viên
- `audit_log` - Nhật ký audit hệ thống

## 🔗 API Routes

- `/api/get-bill` - Tra cứu hóa đơn Cổng 1
- `/api/check-electricity` - Tra cứu hóa đơn Cổng 2 (7ty.vn)
- Supabase xử lý tất cả các thao tác CRUD khác thông qua RLS policies

## 🚀 Deployment

### Netlify (Khuyến nghị)

1. Kết nối repository với Netlify
2. Thiết lập biến môi trường trong Netlify dashboard
3. Deploy với build settings:
   - Build command: `pnpm run build`
   - Publish directory: `.next`

### Biến môi trường cho Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
API_BASE_URL=your_gateway_1_url
API_GET_BILL_PATH=/api/get-bill
API_COOKIE=your_api_cookie
API_CSRF_TOKEN=your_csrf_token
NEW_API_BASE_URL=https://bill.7ty.vn
NEW_API_PATH=/api/check-electricity
NODE_ENV=production
```

## 🔒 Tính năng bảo mật

- Row Level Security (RLS) policies
- Kiểm soát truy cập dựa trên vai trò (admin/user)
- Xác thực JWT token
- Audit logging cho tất cả thay đổi
- Validation và sanitization input

## 📁 Cấu trúc dự án

```
/workspace/shadcn-ui/
├── app/
│   ├── api/                    # API routes
│   │   ├── get-bill/          # Cổng 1 API
│   │   └── check-electricity/ # Cổng 2 API
│   ├── dashboard/             # Trang dashboard chính
│   ├── login/                 # Trang đăng nhập
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── auth/                 # Authentication components
│   └── dashboard/            # Dashboard components
├── lib/                      # Utilities & Supabase config
├── package.json             # Dependencies
└── README.md               # Documentation
```

## 🎯 Tính năng chính

### 1. Tra cứu hóa đơn
- Hỗ trợ 2 cổng API (Cổng 1 & Cổng 2 - 7ty.vn)
- Tra cứu hàng loạt với xử lý lỗi
- Lọc trùng lặp tự động
- Hiển thị kết quả real-time

### 2. Quản lý kho
- Nhập hóa đơn vào kho
- Xuất hóa đơn khi bán
- Theo dõi trạng thái nhập/xuất
- Preview kho với thống kê

### 3. Quản lý nhân viên (Admin only)
- CRUD nhân viên với phân quyền
- Tìm kiếm và lọc
- Ghi chú công việc
- Audit trail

### 4. Quản lý khách hàng & Bán hàng
- Quản lý khách hàng thẻ (KHT)
- Bán hóa đơn cho khách hàng
- Lịch sử giao dịch chi tiết
- Lọc theo giá trị

### 5. Bảng kết quả
- Hiển thị dạng bảng/lưới
- Tìm kiếm, sắp xếp, phân trang
- Xuất Excel, sao chép clipboard
- Tổng tiền tự động

## 🔧 Development

### Scripts có sẵn

```bash
pnpm run dev      # Chạy development server
pnpm run build    # Build production
pnpm run start    # Chạy production server
pnpm run lint     # Lint code
```

### Thêm dependencies

```bash
pnpm add package_name
```

## 📝 License

Đây là phần mềm độc quyền. Mọi quyền được bảo lưu.

---

**Lưu ý**: Đây là phiên bản hiện đại hóa hoàn toàn từ hệ thống Express.js cũ, với cải tiến về hiệu suất, bảo mật và trải nghiệm người dùng.