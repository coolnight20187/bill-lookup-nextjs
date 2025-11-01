# Bill Lookup System - Next.js

A modern bill lookup and management system built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure login with Supabase Auth
- 📊 **Bill Lookup**: Query electricity bills from multiple API gateways
- 👥 **Employee Management**: Admin can manage employees with roles
- 🏪 **Customer Management**: Manage card customers (KHT)
- 📦 **Warehouse System**: Import/export bill management
- 📈 **Transaction History**: Track all sales and transactions
- 📝 **Work Notes**: Employee work notes system
- 🌙 **Dark Mode**: Full dark/light theme support
- 📱 **Responsive**: Mobile-first responsive design

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with RLS
- **Deployment**: Netlify (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bill-lookup-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase and API credentials in `.env.local`.

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL scripts in order:
     - `/workspace/supabase_schema.sql`
     - `/workspace/supabase_rls_policies.sql`
     - `/workspace/supabase_auth_setup.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Login

- **Username**: admin
- **Password**: 123456

## Database Schema

The system uses the following main tables:

- `employees` - Employee management with roles
- `members` - Card customers (KHT)
- `warehouse` - Bill storage system
- `transaction_history` - Sales transaction records
- `work_notes` - Employee work notes
- `audit_log` - System audit trail

## API Routes

- `/api/get-bill` - Gateway 1 bill lookup
- `/api/check-electricity` - Gateway 2 bill lookup (7ty.vn)
- Supabase handles all other CRUD operations via RLS policies

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with these build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Environment Variables for Production

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

## Security Features

- Row Level Security (RLS) policies
- Role-based access control (admin/user)
- JWT token authentication
- Audit logging for all changes
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.