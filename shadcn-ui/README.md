# 🔍 Hệ thống Tra cứu Hóa đơn Điện - Next.js 14

Hệ thống tra cứu và quản lý hóa đơn điện hiện đại được xây dựng với Next.js 14, TypeScript, Supabase và Tailwind CSS.

## ✨ Tính năng chính

- 🔐 **Xác thực bảo mật**: Đăng nhập với Supabase Auth và phân quyền vai trò
- 📊 **Tra cứu đa cổng**: Hỗ trợ 2 cổng API (Cổng 1 & Cổng 2 - 7ty.vn)
- 👥 **Quản lý nhân viên**: CRUD nhân viên với phân quyền admin/user
- 🏪 **Quản lý khách hàng**: Quản lý khách hàng thẻ (KHT) và bán hàng
- 📦 **Hệ thống kho**: Nhập/xuất hóa đơn với tracking đầy đủ
- 📈 **Lịch sử giao dịch**: Theo dõi chi tiết tất cả giao dịch bán hàng
- 📝 **Ghi chú công việc**: Hệ thống ghi chú và audit cho nhân viên
- 🌙 **Dark/Light Mode**: Theme switching với next-themes
- 📱 **Responsive Design**: Mobile-first với Tailwind CSS
- 📊 **Xuất dữ liệu**: Export Excel, copy clipboard, tìm kiếm nâng cao

## 🛠️ Công nghệ sử dụng

### Frontend
- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety và developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icons

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database với real-time capabilities
- **Row Level Security (RLS)** - Database-level security
- **Supabase Auth** - Authentication và authorization

### Development & Deployment
- **pnpm** - Fast package manager
- **ESLint** - Code linting
- **Render/Cloudflare Pages** - Deployment platforms

## 🚀 Cài đặt và chạy local

### Yêu cầu hệ thống
- Node.js 18+
- pnpm 8+
- Tài khoản Supabase

### Bước 1: Clone và cài đặt
```bash
git clone <repository-url>
cd bill-lookup-nextjs
pnpm install
```

### Bước 2: Cấu hình môi trường
```bash
cp .env.example .env.local
```

Điền thông tin vào `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Gateway 1 (Original)
API_BASE_URL=https://your-api-gateway-1.com
API_GET_BILL_PATH=/api/get-bill
API_COOKIE=your_api_cookie
API_CSRF_TOKEN=your_csrf_token

# API Gateway 2 (7ty.vn)
NEW_API_BASE_URL=https://bill.7ty.vn
NEW_API_PATH=/api/check-electricity
```

### Bước 3: Setup Supabase Database
1. Tạo project mới trên [Supabase](https://supabase.com)
2. Chạy các SQL scripts theo thứ tự:
   - `/workspace/supabase_schema.sql`
   - `/workspace/supabase_rls_policies.sql`
   - `/workspace/supabase_auth_setup.sql`

### Bước 4: Chạy ứng dụng
```bash
pnpm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

**Đăng nhập mặc định:**
- Username: `admin`
- Password: `123456`

## 📊 Cấu trúc Database

### Bảng chính
- `employees` - Quản lý nhân viên với roles
- `members` - Khách hàng thẻ (KHT)
- `warehouse` - Hệ thống lưu trữ hóa đơn
- `transaction_history` - Lịch sử giao dịch bán hàng
- `work_notes` - Ghi chú công việc nhân viên
- `audit_log` - Nhật ký audit hệ thống

### API Endpoints
- `/api/get-bill` - Tra cứu hóa đơn Cổng 1
- `/api/check-electricity` - Tra cứu hóa đơn Cổng 2 (7ty.vn)
- Supabase RLS xử lý tất cả CRUD operations khác

## 🎯 Tính năng chi tiết

### 1. 📊 Tra cứu Hóa đơn
- **Đa cổng API**: Hỗ trợ 2 cổng với format khác nhau
- **Batch processing**: Tra cứu hàng loạt với error handling
- **Auto-deduplication**: Lọc trùng lặp tự động
- **Real-time results**: Hiển thị kết quả progressive

### 2. 📦 Quản lý Kho
- **Import system**: Nhập hóa đơn từ kết quả tra cứu
- **Export tracking**: Theo dõi trạng thái xuất kho
- **Inventory management**: Quản lý tồn kho với preview
- **Bulk operations**: Thao tác hàng loạt

### 3. 👥 Quản lý Nhân viên (Admin only)
- **CRUD operations**: Tạo, đọc, cập nhật, xóa nhân viên
- **Role management**: Phân quyền admin/user
- **Search & filter**: Tìm kiếm và lọc nâng cao
- **Work notes**: Hệ thống ghi chú công việc
- **Audit trail**: Theo dõi hoạt động

### 4. 🏪 Bán hàng & Khách hàng
- **Customer management**: Quản lý khách hàng thẻ (KHT)
- **Sales process**: Quy trình bán hàng với tracking
- **Transaction history**: Lịch sử giao dịch chi tiết
- **Price filtering**: Lọc theo khoảng giá
- **Member profiles**: Hồ sơ khách hàng với Zalo/Bank info

### 5. 📋 Bảng kết quả nâng cao
- **Multiple views**: List view và Grid view
- **Advanced search**: Tìm kiếm đa trường
- **Smart sorting**: Sắp xếp thông minh
- **Pagination**: Phân trang với tùy chọn số lượng
- **Export options**: Excel export, clipboard copy
- **Summary statistics**: Thống kê tổng hợp

## 🔒 Bảo mật

### Database Level
- **Row Level Security (RLS)** policies
- **Role-based access control**
- **Audit logging** cho tất cả thay đổi
- **Input validation** và sanitization

### Application Level
- **JWT token authentication**
- **Environment variables** protection
- **API rate limiting**
- **HTTPS enforcement**

## 🚀 Deployment

Xem hướng dẫn chi tiết tại: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Platforms hỗ trợ
- **Render.com** - Recommended for full-stack apps
- **Cloudflare Pages** - Fast global CDN
- **Netlify** - JAMstack deployment
- **Vercel** - Next.js optimized hosting

### Build Commands
```bash
# Development
pnpm run dev

# Production build
pnpm run build
pnpm run start

# Linting
pnpm run lint
pnpm run lint:fix
```

## 📁 Cấu trúc dự án

```
bill-lookup-nextjs/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   └── dashboard/        # Feature components
├── lib/                  # Utilities
│   ├── supabase.ts      # DB config
│   └── utils.ts         # Helper functions
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🔧 Development

### Available Scripts
```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run lint:fix     # Fix linting issues
```

### Code Style
- **TypeScript** strict mode
- **ESLint** với Next.js config
- **Prettier** formatting
- **Conventional commits**

## 📈 Performance

### Optimizations
- **Next.js 14** App Router với Server Components
- **Static generation** cho public pages
- **Image optimization** với next/image
- **Bundle analysis** và code splitting
- **Caching strategies** với Supabase

### Monitoring
- **Supabase Analytics** cho database
- **Platform analytics** (Render/Cloudflare)
- **Error tracking** với built-in logging
- **Performance metrics** monitoring

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure responsive design

## 📄 License

Dự án này là phần mềm độc quyền. Mọi quyền được bảo lưu.

## 🆘 Support & Documentation

- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **API Documentation**: Xem comments trong code
- **Database Schema**: `/workspace/supabase_*.sql`
- **Component Library**: [shadcn/ui docs](https://ui.shadcn.com)

---

**Phiên bản hiện đại hóa hoàn toàn từ Express.js legacy system** 🚀

Built with ❤️ using Next.js 14, TypeScript, Supabase & Tailwind CSS