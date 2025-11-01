# Hệ thống Tra cứu Hóa đơn Điện - Thiết kế Hiện đại hóa

## 1. Phương pháp Triển khai

### Công nghệ Hiện tại vs Mục tiêu
**Hiện tại:**
- Backend: Express.js + PostgreSQL + bcrypt + session
- Frontend: Vanilla JS + Bootstrap 5 + HTML/CSS
- Deployment: Render (monolithic)

**Mục tiêu:**
- Full-stack: Next.js 14 + TypeScript + App Router
- Database: Supabase (PostgreSQL + Auth + RLS)
- UI: Shadcn-ui + Tailwind CSS + Radix UI
- Deployment: Netlify (serverless)
- Authentication: Supabase Auth với JWT

### Lý do Chuyển đổi
1. **Bảo mật nâng cao**: Supabase RLS, JWT tokens, serverless functions
2. **Hiệu suất tốt hơn**: Next.js SSR/SSG, edge functions, caching
3. **Developer Experience**: TypeScript type safety, modern tooling
4. **Scalability**: Serverless architecture, auto-scaling
5. **Maintainability**: Component-based architecture, better code organization

## 2. Tương tác Người dùng & UI chính

### Luồng Xác thực
1. **Đăng nhập** → Supabase Auth với email/password
2. **Phân quyền** → RLS policies dựa trên user role (admin/user)
3. **Session** → JWT tokens với auto-refresh

### Các Tương tác UI Chính
1. **Dashboard**: Tổng quan số liệu, quick actions
2. **Tra cứu Hóa đơn**: 
   - Input mã khách hàng (bulk/single)
   - Chọn nhà cung cấp (Cổng 1/Cổng 2)
   - Hiển thị kết quả dạng table/grid
3. **Quản lý Kho**:
   - Nhập hóa đơn vào kho
   - Lọc theo giá trị
   - Xuất/bán hóa đơn
4. **Quản lý Nhân viên** (Admin):
   - CRUD nhân viên
   - Phân quyền
   - Ghi chú công việc
5. **Quản lý Khách hàng thẻ**:
   - CRUD khách hàng
   - Lịch sử giao dịch

## 3. Kiến trúc Hệ thống

```plantuml
@startuml
package "Frontend (Next.js)" {
  [Dashboard Page] as dashboard
  [Auth Pages] as auth
  [Bill Lookup] as lookup
  [Warehouse Management] as warehouse
  [Employee Management] as employee
  [Customer Management] as customer
}

package "API Layer" {
  [Next.js API Routes] as api
  [Server Actions] as actions
  [Middleware] as middleware
}

package "External APIs" {
  [Cổng 1 API] as gate1
  [Cổng 2 API (7ty.vn)] as gate2
}

package "Supabase Backend" {
  [Authentication] as auth_service
  [PostgreSQL Database] as db
  [Row Level Security] as rls
  [Edge Functions] as edge
}

package "Deployment" {
  [Netlify] as netlify
  [CDN] as cdn
}

dashboard --> api
auth --> auth_service
lookup --> api
warehouse --> actions
employee --> api
customer --> actions

api --> gate1
api --> gate2
api --> db
actions --> db

auth_service --> rls
rls --> db

netlify --> cdn
api --> netlify
@enduml
```

## 4. Luồng Điều hướng UI

```plantuml
@startuml
state "Login" as Login {
  [*] --> Login
}
state "Dashboard" as Dashboard
state "Bill-Lookup" as BillLookup
state "Warehouse" as Warehouse
state "Employees" as Employees
state "Customers" as Customers
state "History" as History

Login --> Dashboard : successful auth
Dashboard --> BillLookup : tra cứu hóa đơn
Dashboard --> Warehouse : quản lý kho
Dashboard --> Employees : quản lý nhân viên (admin)
Dashboard --> Customers : quản lý khách hàng
Dashboard --> History : xem lịch sử

BillLookup --> Dashboard : back to home
BillLookup --> Warehouse : import to warehouse
Warehouse --> Dashboard : back to home
Warehouse --> Customers : sell to customer
Employees --> Dashboard : back to home
Customers --> Dashboard : back to home
History --> Dashboard : back to home

Warehouse --> History : view transaction history
Customers --> History : view customer history
@enduml
```

## 5. Cấu trúc Dữ liệu & Interface

```plantuml
@startuml
interface IUser {
  +id: string
  +email: string
  +role: 'admin' | 'user'
  +full_name?: string
  +phone?: string
  +created_at: Date
}

interface IBill {
  +id: string
  +account: string
  +provider_id: string
  +name: string
  +address: string
  +amount_current: number
  +amount_previous: number
  +total: number
  +raw_data: object
}

interface IWarehouseItem {
  +id: string
  +bill_id: string
  +imported_at: Date
  +exported_at?: Date
  +imported_by: string
}

interface ICustomer {
  +id: string
  +name: string
  +zalo?: string
  +bank?: string
  +created_at: Date
}

interface ITransaction {
  +id: string
  +bill_id: string
  +customer_id: string
  +employee_id: string
  +sold_at: Date
  +amount: number
}

interface IWorkNote {
  +id: string
  +employee_id: string
  +author_id: string
  +note_text: string
  +created_at: Date
}

class UserService {
  +authenticate(email: string, password: string): Promise<IUser>
  +getCurrentUser(): Promise<IUser | null>
  +updateProfile(data: Partial<IUser>): Promise<IUser>
}

class BillService {
  +lookupBills(accounts: string[], provider: string): Promise<IBill[]>
  +importToWarehouse(bills: IBill[]): Promise<void>
  +exportFromWarehouse(billIds: string[]): Promise<void>
}

class CustomerService {
  +getCustomers(): Promise<ICustomer[]>
  +createCustomer(data: Omit<ICustomer, 'id'>): Promise<ICustomer>
  +updateCustomer(id: string, data: Partial<ICustomer>): Promise<ICustomer>
}

UserService ..> IUser
BillService ..> IBill
BillService ..> IWarehouseItem
CustomerService ..> ICustomer
@enduml
```

## 6. Luồng Xử lý Chương trình

```plantuml
@startuml
actor User
participant "Next.js App" as App
participant "Supabase Auth" as Auth
participant "API Routes" as API
participant "Supabase DB" as DB
participant "External APIs" as ExtAPI

User -> App: Access Application
App -> Auth: Check Authentication
Auth --> App: Return User Session
    note right
        JWT Token với user metadata:
        {
            "user_id": "uuid",
            "email": "string", 
            "role": "admin|user",
            "exp": timestamp
        }
    end note

User -> App: Tra cứu Hóa đơn
App -> API: POST /api/bills/lookup
    note right
        Input: {
            "accounts": ["PB123...", "PA456..."],
            "provider_id": "00906815"
        }
    end note
API -> ExtAPI: Gọi API Cổng 1/2
ExtAPI --> API: Trả về dữ liệu hóa đơn
    note right
        Output: {
            "bills": [{
                "account": "string",
                "name": "string", 
                "address": "string",
                "total": number,
                "raw_data": object
            }]
        }
    end note
API --> App: Kết quả tra cứu

User -> App: Nhập vào Kho
App -> API: POST /api/warehouse/import
    note right
        Input: {
            "bill_ids": ["uuid1", "uuid2"],
            "imported_by": "user_id"
        }
    end note
API -> DB: INSERT warehouse_items
DB --> API: Xác nhận thành công
API --> App: Phản hồi nhập kho

User -> App: Bán hàng
App -> API: POST /api/transactions/sell
    note right
        Input: {
            "bill_ids": ["uuid1"],
            "customer_id": "uuid", 
            "employee_id": "uuid",
            "sold_at": "ISO_timestamp"
        }
    end note
API -> DB: BEGIN Transaction
API -> DB: INSERT transactions
API -> DB: UPDATE warehouse_items SET exported_at
API -> DB: COMMIT
DB --> API: Transaction thành công
    note right
        Output: {
            "transaction_id": "uuid",
            "total_amount": number,
            "sold_count": number
        }
    end note
API --> App: Xác nhận bán hàng
@enduml
```

## 7. Cấu trúc Database (Supabase)

```plantuml
@startuml
entity "users" as users {
  * id : uuid <<PK>>
  --
  * email : varchar
  * role : enum('admin', 'user')
  full_name : varchar
  phone : varchar
  created_at : timestamptz
}

entity "bills" as bills {
  * id : uuid <<PK>>
  --
  * account : varchar
  * provider_id : varchar
  * name : varchar
  * address : varchar
  * amount_current : bigint
  * amount_previous : bigint
  * total : bigint
  * raw_data : jsonb
  * created_at : timestamptz
}

entity "warehouse_items" as warehouse {
  * id : uuid <<PK>>
  --
  * bill_id : uuid <<FK>>
  * imported_at : timestamptz
  exported_at : timestamptz
  * imported_by : uuid <<FK>>
}

entity "customers" as customers {
  * id : uuid <<PK>>
  --
  * name : varchar
  zalo : varchar
  bank : varchar
  * created_at : timestamptz
}

entity "transactions" as transactions {
  * id : uuid <<PK>>
  --
  * bill_id : uuid <<FK>>
  * customer_id : uuid <<FK>>
  * employee_id : uuid <<FK>>
  * sold_at : timestamptz
  * amount : bigint
}

entity "work_notes" as notes {
  * id : uuid <<PK>>
  --
  * employee_id : uuid <<FK>>
  * author_id : uuid <<FK>>
  * note_text : text
  * created_at : timestamptz
}

users ||--o{ warehouse : "warehouse.imported_by -> users.id"
users ||--o{ transactions : "transactions.employee_id -> users.id"
users ||--o{ notes : "notes.employee_id -> users.id"
users ||--o{ notes : "notes.author_id -> users.id"
bills ||--o{ warehouse : "warehouse.bill_id -> bills.id"
bills ||--o{ transactions : "transactions.bill_id -> bills.id"
customers ||--o{ transactions : "transactions.customer_id -> customers.id"
@enduml
```

## 8. Những điểm Chưa rõ

1. **Migration Strategy**: Cần xác định cách migrate dữ liệu từ PostgreSQL hiện tại sang Supabase
2. **API Rate Limiting**: Cần implement rate limiting cho external API calls
3. **Caching Strategy**: Quyết định sử dụng Redis hay Next.js built-in caching
4. **File Upload**: Nếu cần upload files (avatar, documents), sử dụng Supabase Storage
5. **Real-time Features**: Có cần real-time updates cho warehouse/transactions không?
6. **Mobile Responsiveness**: Mức độ tối ưu cho mobile devices
7. **Backup Strategy**: Cách backup và restore data từ Supabase
8. **Environment Variables**: Quản lý secrets và config cho multiple environments
9. **Error Monitoring**: Sentry hay monitoring service nào khác
10. **Testing Strategy**: Unit tests, integration tests, E2E tests scope

## 9. Kế hoạch Triển khai

### Phase 1: Setup & Infrastructure
- Setup Next.js 14 project với TypeScript
- Configure Supabase project và database schema
- Setup Shadcn-ui và Tailwind CSS
- Implement authentication với Supabase Auth

### Phase 2: Core Features
- Migrate bill lookup functionality
- Implement warehouse management
- Create user management system
- Build customer management

### Phase 3: Advanced Features  
- Add work notes system
- Implement transaction history
- Add reporting and analytics
- Performance optimization

### Phase 4: Deployment & Testing
- Deploy to Netlify
- Setup CI/CD pipeline
- Comprehensive testing
- Documentation và training