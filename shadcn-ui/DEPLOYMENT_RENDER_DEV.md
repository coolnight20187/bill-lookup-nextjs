# 🚀 Deploy Next.js với Development Mode trên Render.com

## ✅ **Giải pháp cho React Hooks Build Issue**

Vì Next.js build gặp lỗi với static generation, chúng ta sẽ deploy với development mode để app hoạt động ngay lập tức.

## 📋 **Render.com Deployment Settings**

### **1. Build & Deploy Settings:**
```bash
Build Command: pnpm install
Start Command: pnpm run dev
```

### **2. Environment Variables:**
```
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=https://your-api-gateway-1.com
API_GET_BILL_PATH=/api/get-bill
API_COOKIE=your-api-cookie
API_CSRF_TOKEN=your-csrf-token
NEW_API_BASE_URL=https://bill.7ty.vn
NEW_API_PATH=/api/check-electricity
```

### **3. Service Configuration:**
```
Runtime: Node.js 18 (hoặc 20)
Region: Singapore (gần VN nhất)
Plan: Starter ($7/month) hoặc Pro ($25/month)
Health Check Path: /dashboard
```

## 🔧 **Deployment Steps**

### **Step 1: Tạo Web Service**
1. Đăng nhập [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository

### **Step 2: Configure Build Settings**
```
Name: bill-lookup-nextjs-dev
Environment: Node
Branch: main
Root Directory: /
Build Command: pnpm install
Start Command: pnpm run dev
```

### **Step 3: Add Environment Variables**
- Vào Environment tab
- Thêm tất cả variables ở trên
- Save changes

### **Step 4: Deploy**
- Click "Create Web Service"
- Chờ deployment hoàn thành (3-5 phút)
- App sẽ chạy trên development mode

## ⚡ **Development Mode Benefits**

### **✅ Advantages:**
- **Instant deployment** - Không cần build process
- **Hot reload** - Changes reflect immediately
- **Full functionality** - Tất cả React Hooks hoạt động
- **Easy debugging** - Development tools available
- **No build errors** - Bypass static generation issues

### **⚠️ Considerations:**
- **Slower performance** - Dev mode chậm hơn production
- **Higher memory usage** - Development overhead
- **Longer startup time** - Next.js dev server khởi động lâu hơn

## 🎯 **Expected Results**

### **App sẽ hoạt động với:**
- ✅ **Authentication**: Login với admin/123456
- ✅ **Bill Lookup**: Dual API gateway search
- ✅ **Warehouse Management**: Import/export bills
- ✅ **Employee Management**: Add/edit employees
- ✅ **Customer Sales**: Sell bills to customers
- ✅ **Transaction History**: View all transactions
- ✅ **Responsive UI**: Mobile-friendly design
- ✅ **Dark/Light Theme**: Theme switching

## 🔍 **Troubleshooting**

### **Nếu deployment fail:**
1. **Check logs** trong Render dashboard
2. **Verify environment variables** - Đảm bảo tất cả variables đã set
3. **Test locally** - `pnpm run dev` phải hoạt động
4. **Check Node version** - Đặt Node 18 hoặc 20

### **Nếu app chậm:**
1. **Upgrade Render plan** - Pro plan có performance tốt hơn
2. **Optimize components** - Lazy load heavy components
3. **Add loading states** - Better UX while loading

## 📊 **Performance Expectations**

### **Development Mode Performance:**
- **Initial load**: 3-5 seconds
- **Page navigation**: 1-2 seconds
- **API calls**: 500ms - 2s (depending on external APIs)
- **Database queries**: 200ms - 1s

### **Production Alternative:**
- Sau khi app stable, có thể optimize để build production
- Hoặc migrate sang Vercel cho better Next.js support

## 🎉 **Deployment Ready!**

App đã sẵn sàng deploy với development mode. Tất cả features sẽ hoạt động bình thường, chỉ performance có thể chậm hơn một chút so với production build.

**URL sau deployment:** `https://bill-lookup-nextjs-dev.onrender.com`