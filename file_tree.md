# Cấu trúc Thư mục Dự án - Next.js 14 + Supabase

```
bill-lookup-app/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local
├── .env.example
├── .gitignore
├── components.json                    # Shadcn-ui config
├── 
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── placeholder-avatar.png
│
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout với providers
│   │   ├── page.tsx                  # Dashboard homepage
│   │   ├── loading.tsx               # Global loading UI
│   │   ├── error.tsx                 # Global error UI
│   │   ├── not-found.tsx            # 404 page
│   │   │
│   │   ├── (auth)/                   # Route group cho auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Auth layout
│   │   │
│   │   ├── dashboard/                # Protected routes
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── layout.tsx            # Dashboard layout với sidebar
│   │   │   │
│   │   │   ├── bills/                # Bill management
│   │   │   │   ├── page.tsx          # Bill lookup page
│   │   │   │   ├── lookup/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Bill detail
│   │   │   │
│   │   │   ├── warehouse/            # Warehouse management
│   │   │   │   ├── page.tsx          # Warehouse overview
│   │   │   │   ├── import/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── export/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── customers/            # Customer management
│   │   │   │   ├── page.tsx          # Customer list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Add customer
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Customer detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit customer
│   │   │   │
│   │   │   ├── employees/            # Employee management (Admin)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── notes/
│   │   │   │           └── page.tsx  # Work notes
│   │   │   │
│   │   │   ├── transactions/         # Transaction history
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Transaction detail
│   │   │   │
│   │   │   └── settings/             # User settings
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       │   └── page.tsx
│   │   │       └── security/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                      # API Routes
│   │       ├── auth/
│   │       │   ├── callback/
│   │       │   │   └── route.ts      # Supabase auth callback
│   │       │   └── signout/
│   │       │       └── route.ts
│   │       │
│   │       ├── bills/
│   │       │   ├── lookup/
│   │       │   │   └── route.ts      # POST /api/bills/lookup
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET/PUT/DELETE /api/bills/[id]
│   │       │
│   │       ├── warehouse/
│   │       │   ├── import/
│   │       │   │   └── route.ts      # POST /api/warehouse/import
│   │       │   ├── export/
│   │       │   │   └── route.ts      # POST /api/warehouse/export
│   │       │   └── items/
│   │       │       └── route.ts      # GET /api/warehouse/items
│   │       │
│   │       ├── customers/
│   │       │   ├── route.ts          # GET/POST /api/customers
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET/PUT/DELETE /api/customers/[id]
│   │       │
│   │       ├── employees/
│   │       │   ├── route.ts          # GET/POST /api/employees
│   │       │   └── [id]/
│   │       │       ├── route.ts      # GET/PUT/DELETE /api/employees/[id]
│   │       │       └── notes/
│   │       │           └── route.ts  # GET/POST /api/employees/[id]/notes
│   │       │
│   │       └── transactions/
│   │           ├── route.ts          # GET/POST /api/transactions
│   │           └── [id]/
│   │               └── route.ts      # GET /api/transactions/[id]
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── ui/                       # Shadcn-ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── navigation.tsx
│   │   │
│   │   ├── auth/                     # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── auth-provider.tsx
│   │   │   └── protected-route.tsx
│   │   │
│   │   ├── bills/                    # Bill-related components
│   │   │   ├── bill-lookup-form.tsx
│   │   │   ├── bill-table.tsx
│   │   │   ├── bill-card.tsx
│   │   │   ├── bill-grid.tsx
│   │   │   └── provider-selector.tsx
│   │   │
│   │   ├── warehouse/                # Warehouse components
│   │   │   ├── warehouse-table.tsx
│   │   │   ├── import-dialog.tsx
│   │   │   ├── export-dialog.tsx
│   │   │   └── price-filter.tsx
│   │   │
│   │   ├── customers/                # Customer components
│   │   │   ├── customer-table.tsx
│   │   │   ├── customer-form.tsx
│   │   │   ├── customer-card.tsx
│   │   │   └── customer-search.tsx
│   │   │
│   │   ├── employees/                # Employee components
│   │   │   ├── employee-table.tsx
│   │   │   ├── employee-form.tsx
│   │   │   ├── work-notes.tsx
│   │   │   └── role-badge.tsx
│   │   │
│   │   ├── transactions/             # Transaction components
│   │   │   ├── transaction-table.tsx
│   │   │   ├── transaction-form.tsx
│   │   │   ├── sales-dialog.tsx
│   │   │   └── transaction-history.tsx
│   │   │
│   │   └── common/                   # Common components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── data-table.tsx
│   │       ├── search-input.tsx
│   │       ├── pagination.tsx
│   │       ├── export-button.tsx
│   │       └── theme-toggle.tsx
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── supabase/                 # Supabase configuration
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   ├── middleware.ts         # Auth middleware
│   │   │   └── database.types.ts     # Generated types
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   ├── auth.service.ts
│   │   │   ├── bill.service.ts
│   │   │   ├── warehouse.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── employee.service.ts
│   │   │   └── transaction.service.ts
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-bills.ts
│   │   │   ├── use-warehouse.ts
│   │   │   ├── use-customers.ts
│   │   │   ├── use-employees.ts
│   │   │   └── use-transactions.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── cn.ts                 # Class name utility
│   │   │   ├── format.ts             # Formatting utilities
│   │   │   ├── validation.ts         # Validation schemas
│   │   │   ├── constants.ts          # App constants
│   │   │   └── api-client.ts         # API client wrapper
│   │   │
│   │   └── types/                    # TypeScript type definitions
│   │       ├── auth.types.ts
│   │       ├── bill.types.ts
│   │       ├── warehouse.types.ts
│   │       ├── customer.types.ts
│   │       ├── employee.types.ts
│   │       ├── transaction.types.ts
│   │       └── api.types.ts
│   │
│   └── styles/                       # Global styles
│       ├── globals.css               # Global CSS with Tailwind
│       └── components.css            # Component-specific styles
│
├── supabase/                         # Supabase configuration
│   ├── config.toml
│   ├── seed.sql                      # Initial data
│   │
│   ├── migrations/                   # Database migrations
│   │   ├── 20240101000000_initial_schema.sql
│   │   ├── 20240101000001_create_user_profiles.sql
│   │   ├── 20240101000002_create_bills.sql
│   │   ├── 20240101000003_create_warehouse.sql
│   │   ├── 20240101000004_create_customers.sql
│   │   ├── 20240101000005_create_transactions.sql
│   │   ├── 20240101000006_create_work_notes.sql
│   │   └── 20240101000007_setup_rls_policies.sql
│   │
│   └── functions/                    # Edge functions
│       ├── bill-lookup/
│       │   └── index.ts              # External API calls
│       └── export-data/
│           └── index.ts              # Data export functionality
│
├── docs/                             # Documentation
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── API.md
│   ├── CONTRIBUTING.md
│   └── CHANGELOG.md
│
├── tests/                            # Test files
│   ├── __mocks__/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── e2e/
│       └── playwright.config.ts
│
└── scripts/                          # Build and deployment scripts
    ├── build.sh
    ├── deploy.sh
    └── migrate.js                    # Data migration script
```

## Các File Cấu hình Chính

### package.json
```json
{
  "name": "bill-lookup-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "shadcn-ui": "latest",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

### .env.example
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External APIs
API_BASE_URL=https://your-gate1-api.com
API_GET_BILL_PATH=/api/get-bill
API_COOKIE=your_api_cookie
API_CSRF_TOKEN=your_csrf_token

NEW_API_BASE_URL=https://bill.7ty.vn
NEW_API_PATH=/api/check-electricity

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Tính năng của Cấu trúc

1. **Modular Architecture**: Tách biệt rõ ràng giữa UI, business logic, và data layer
2. **Type Safety**: TypeScript được sử dụng toàn bộ dự án
3. **Scalable Routing**: App Router của Next.js 14 với route groups
4. **Reusable Components**: Shadcn-ui components với customization
5. **Service Layer**: Business logic tách biệt khỏi UI components
6. **Database Management**: Supabase migrations và RLS policies
7. **Testing Ready**: Cấu trúc sẵn sàng cho unit và E2E testing
8. **Documentation**: Tài liệu chi tiết cho development và deployment