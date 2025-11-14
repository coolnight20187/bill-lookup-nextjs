# 🚀 Hướng dẫn Deploy Dự án Tra cứu Bill

Hướng dẫn chi tiết để deploy dự án Next.js 14 lên các nền tảng phổ biến.

## 📋 Chuẩn bị trước khi deploy

### 1. Kiểm tra dự án local
```bash
cd /workspace/shadcn-ui
pnpm install
pnpm run build
pnpm run start
```

### 2. Tạo tài khoản các dịch vụ
- [GitHub](https://github.com) - Lưu trữ code
- [Supabase](https://supabase.com) - Database và Authentication
- [Render](https://render.com) hoặc [Cloudflare Pages](https://pages.cloudflare.com) - Hosting

## 🗃️ BƯỚC 1: Setup GitHub Repository

### 1.1 Tạo repository mới trên GitHub
1. Đăng nhập GitHub → New Repository
2. Tên repository: `bill-lookup-nextjs`
3. Chọn Public hoặc Private
4. Không tích "Initialize with README"

### 1.2 Push code lên GitHub
```bash
cd /workspace/shadcn-ui

# Khởi tạo git (nếu chưa có)
git init
git add .
git commit -m "Initial commit: Next.js 14 bill lookup system"

# Kết nối với GitHub (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bill-lookup-nextjs.git
git branch -M main
git push -u origin main
```

### 1.3 Tạo file .gitignore (nếu chưa có)
```bash
# .gitignore
node_modules/
.next/
.env.local
.env*.local
*.log
.DS_Store
dist/
build/
```

## 🗄️ BƯỚC 2: Setup Supabase Database

### 2.1 Tạo project Supabase
1. Đăng nhập [Supabase](https://supabase.com)
2. Tạo New Project
3. Chọn Organization và Region (Singapore cho VN)
4. Đặt tên project: `bill-lookup-system`
5. Tạo Database Password mạnh

### 2.2 Chạy SQL Scripts
Vào Supabase Dashboard → SQL Editor, chạy lần lượt:

1. **Schema Creation** (`/workspace/supabase_schema.sql`)
2. **RLS Policies** (`/workspace/supabase_rls_policies.sql`)  
3. **Auth Setup** (`/workspace/supabase_auth_setup.sql`)

### 2.3 Lấy thông tin kết nối
Vào Settings → API:
- `Project URL` → NEXT_PUBLIC_SUPABASE_URL
- `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY

### 2.4 Cấu hình Authentication
1. Vào Authentication → Settings
2. Bật Email confirmations (tùy chọn)
3. Thêm site URL: `https://your-app-domain.com`

## 🌐 BƯỚC 3A: Deploy lên Render.com

### 3A.1 Tạo Web Service
1. Đăng nhập [Render](https://render.com)
2. New → Web Service
3. Connect GitHub repository `bill-lookup-nextjs`

### 3A.2 Cấu hình Build Settings
```
Name: bill-lookup-system
Environment: Node
Region: Singapore (gần VN nhất)
Branch: main
Build Command: pnpm install && pnpm run build
Start Command: pnpm start
Node Version: 18 (hoặc 20)
```

### 3A.3 Environment Variables
Thêm các biến môi trường trong Render Dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=https://your-api-gateway-1.com
API_GET_BILL_PATH=/api/get-bill
API_COOKIE=your-api-cookie
API_CSRF_TOKEN=your-csrf-token
NEW_API_BASE_URL=https://bill.7ty.vn
NEW_API_PATH=/api/check-electricity
NODE_ENV=production
```

### 3A.4 Deploy
1. Nhấn "Create Web Service"
2. Chờ build và deploy (5-10 phút)
3. Kiểm tra logs nếu có lỗi

### 3A.5 Troubleshooting Render
Nếu build fail:
1. **Vite config conflict**: Đảm bảo không có `vite.config.ts` trong project
2. **Node version**: Đặt Node version 18 hoặc 20 trong Render settings
3. **Build command**: Sử dụng `pnpm install && pnpm run build`
4. **Start command**: Sử dụng `pnpm start`

## 🌐 BƯỚC 3B: Deploy lên Cloudflare Pages

### 3B.1 Tạo Pages Project
1. Đăng nhập [Cloudflare](https://dash.cloudflare.com)
2. Pages → Create a project
3. Connect to Git → Chọn GitHub repo

### 3B.2 Build Settings
```
Framework preset: Next.js
Build command: pnpm install && pnpm run build
Build output directory: .next
Root directory: /
Node.js version: 18
```

### 3B.3 Environment Variables
Vào Settings → Environment variables, thêm:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=https://your-api-gateway-1.com
API_GET_BILL_PATH=/api/get-bill
API_COOKIE=your-api-cookie
API_CSRF_TOKEN=your-csrf-token
NEW_API_BASE_URL=https://bill.7ty.vn
NEW_API_PATH=/api/check-electricity
NODE_ENV=production
```

### 3B.4 Deploy
1. Save and Deploy
2. Chờ build hoàn thành
3. Truy cập URL được cung cấp

## 🌐 BƯỚC 3C: Deploy lên Vercel (Alternative)

### 3C.1 Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /workspace/shadcn-ui
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: bill-lookup-nextjs
# - Directory: ./
# - Override settings? No
```

### 3C.2 Environment Variables
```bash
# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other variables
```

## ⚙️ BƯỚC 4: Cấu hình sau Deploy

### 4.1 Cập nhật Supabase Site URL
1. Vào Supabase → Authentication → Settings
2. Site URL: `https://your-deployed-domain.com`
3. Redirect URLs: `https://your-deployed-domain.com/**`

### 4.2 Test tính năng
1. Truy cập ứng dụng
2. Đăng nhập: admin / 123456
3. Test tra cứu hóa đơn
4. Test các tính năng quản lý

### 4.3 Tạo tài khoản admin thực
```sql
-- Chạy trong Supabase SQL Editor
INSERT INTO employees (username, password_hash, role, full_name, is_active)
VALUES ('your-admin', '$2b$10$hashed-password', 'admin', 'Your Name', true);
```

## 🔧 Troubleshooting

### Lỗi Build thường gặp:

1. **"Module not found"**
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **"Vite config found"**
   - Xóa `vite.config.ts` và `vite-env.d.ts`
   - Chỉ giữ `next.config.js`

3. **"BigInt literals not available"**
   - Cập nhật `tsconfig.json` target thành `ES2020`

4. **"Environment variables not found"**
   - Kiểm tra tên biến môi trường
   - Đảm bảo có prefix `NEXT_PUBLIC_` cho client-side

5. **"Supabase connection failed"**
   - Kiểm tra URL và API key
   - Đảm bảo RLS policies đã được tạo

6. **"API routes not working"**
   - Kiểm tra API credentials
   - Test API endpoints riêng lẻ

### Performance Optimization:

1. **Cloudflare (nếu dùng)**
   - Bật caching cho static assets
   - Minify CSS/JS

2. **Render (nếu dùng)**
   - Upgrade plan nếu cần
   - Cấu hình health checks

3. **Vercel (nếu dùng)**
   - Sử dụng Edge Runtime cho API routes
   - Optimize images với next/image

## 📱 BƯỚC 5: Mobile & PWA (Tùy chọn)

### 5.1 Thêm PWA Support
```bash
pnpm add next-pwa
```

### 5.2 Cấu hình manifest.json
```json
{
  "name": "Tra cứu Bill",
  "short_name": "BillLookup",
  "description": "Hệ thống tra cứu hóa đơn điện",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🔐 BƯỚC 6: Bảo mật Production

### 6.1 Environment Security
- Không commit .env files
- Sử dụng secrets management
- Rotate API keys định kỳ

### 6.2 Database Security
- Bật RLS trên tất cả tables
- Audit logs thường xuyên
- Backup database định kỳ

### 6.3 Application Security
- HTTPS only
- CSP headers
- Rate limiting cho API

## 📊 BƯỚC 7: Monitoring & Analytics

### 7.1 Supabase Analytics
- Theo dõi database usage
- Monitor API calls
- Check error logs

### 7.2 Application Monitoring
- Platform analytics (Render/Cloudflare/Vercel)
- Error tracking với Sentry (tùy chọn)
- Performance monitoring

## 🎯 Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] Không có file `vite.config.ts` trong project
- [ ] `tsconfig.json` target ES2020
- [ ] Supabase database đã setup
- [ ] Environment variables đã cấu hình
- [ ] Build thành công local
- [ ] Deploy service đã chọn
- [ ] Domain đã cấu hình
- [ ] SSL certificate active
- [ ] Authentication hoạt động
- [ ] API endpoints test OK
- [ ] Mobile responsive check
- [ ] Performance test
- [ ] Security audit
- [ ] Backup strategy

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Check logs trên platform deploy
2. Test local với production env
3. Kiểm tra Supabase logs
4. Review environment variables
5. Tham khảo documentation của từng service

### Lỗi Render.com cụ thể:
- **Build failed với Vite error**: Xóa tất cả file liên quan đến Vite
- **Node version mismatch**: Đặt Node 18 trong Render settings
- **pnpm not found**: Sử dụng `npm` thay vì `pnpm` nếu cần

---

**Chúc mừng! 🎉 Dự án đã sẵn sàng phục vụ người dùng.**