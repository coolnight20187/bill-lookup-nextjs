-- =====================================================
-- SUPABASE DATABASE SCHEMA FOR BILL LOOKUP SYSTEM
-- Modernized version of Express.js + PostgreSQL app
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. EMPLOYEES TABLE (Replaces users table)
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Will be managed by Supabase Auth
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    full_name TEXT,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    company_name TEXT,
    tax_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES employees(id),
    updated_by UUID REFERENCES employees(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- =====================================================
-- 2. MEMBERS TABLE (Khách hàng thẻ)
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    zalo TEXT,
    bank TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES employees(id),
    updated_by UUID REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);

-- =====================================================
-- 3. WAREHOUSE TABLE (Kho - renamed from 'kho')
-- =====================================================
CREATE TABLE IF NOT EXISTS warehouse (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- Original composite key from old system
    account TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    name TEXT,
    address TEXT,
    amount_current NUMERIC(15,2) DEFAULT 0,
    amount_previous NUMERIC(15,2) DEFAULT 0,
    total NUMERIC(15,2) DEFAULT 0,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    exported_at TIMESTAMPTZ,
    raw_data JSONB,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES employees(id),
    updated_by UUID REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_key ON warehouse(key);
CREATE INDEX IF NOT EXISTS idx_warehouse_account ON warehouse(account);
CREATE INDEX IF NOT EXISTS idx_warehouse_provider ON warehouse(provider_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_status ON warehouse(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_imported_at ON warehouse(imported_at);
CREATE INDEX IF NOT EXISTS idx_warehouse_total ON warehouse(total);

-- =====================================================
-- 4. TRANSACTION_HISTORY TABLE (Lịch sử giao dịch)
-- =====================================================
CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    warehouse_id UUID REFERENCES warehouse(id),
    account TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    name TEXT,
    address TEXT,
    amount_current NUMERIC(15,2) DEFAULT 0,
    amount_previous NUMERIC(15,2) DEFAULT 0,
    total NUMERIC(15,2) DEFAULT 0,
    imported_at TIMESTAMPTZ,
    exported_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    member_id UUID REFERENCES members(id),
    member_name TEXT,
    employee_id UUID REFERENCES employees(id),
    employee_username TEXT,
    transaction_type TEXT DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'return', 'adjustment')),
    raw_data JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_history_warehouse_id ON transaction_history(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_history_member_id ON transaction_history(member_id);
CREATE INDEX IF NOT EXISTS idx_history_employee_id ON transaction_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_history_sold_at ON transaction_history(sold_at);
CREATE INDEX IF NOT EXISTS idx_history_transaction_type ON transaction_history(transaction_type);
CREATE INDEX IF NOT EXISTS idx_history_total ON transaction_history(total);

-- =====================================================
-- 5. WORK_NOTES TABLE (Ghi chú công việc)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
    author_username TEXT,
    note_text TEXT NOT NULL,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'performance', 'training', 'disciplinary', 'achievement')),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_work_notes_employee_id ON work_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_notes_author_id ON work_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_work_notes_created_at ON work_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_work_notes_type ON work_notes(note_type);

-- =====================================================
-- 6. AUDIT_LOG TABLE (New - for tracking changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES employees(id),
    user_email TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- 7. SYSTEM_SETTINGS TABLE (New - for app configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

-- =====================================================
-- 8. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_updated_at BEFORE UPDATE ON warehouse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_history_updated_at BEFORE UPDATE ON transaction_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_notes_updated_at BEFORE UPDATE ON work_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INITIAL DATA SETUP
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('app_name', '"Bill Lookup System"', 'Application name', true),
('app_version', '"2.0.0"', 'Application version', true),
('maintenance_mode', 'false', 'Maintenance mode flag', false),
('max_bills_per_lookup', '100', 'Maximum bills per lookup request', false),
('session_timeout', '3600', 'Session timeout in seconds', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 10. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active warehouse items
CREATE OR REPLACE VIEW active_warehouse AS
SELECT 
    w.*,
    e.username as created_by_username,
    e.full_name as created_by_name
FROM warehouse w
LEFT JOIN employees e ON w.created_by = e.id
WHERE w.status = 'available' AND w.exported_at IS NULL;

-- View for transaction history with member and employee details
CREATE OR REPLACE VIEW transaction_history_detailed AS
SELECT 
    th.*,
    m.name as member_full_name,
    m.phone as member_phone,
    e.full_name as employee_full_name,
    e.phone as employee_phone
FROM transaction_history th
LEFT JOIN members m ON th.member_id = m.id
LEFT JOIN employees e ON th.employee_id = e.id;

-- View for employee performance summary
CREATE OR REPLACE VIEW employee_performance AS
SELECT 
    e.id,
    e.username,
    e.full_name,
    COUNT(th.id) as total_sales,
    COALESCE(SUM(th.total), 0) as total_revenue,
    COUNT(DISTINCT th.member_id) as unique_customers,
    MAX(th.sold_at) as last_sale_date
FROM employees e
LEFT JOIN transaction_history th ON e.id = th.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.username, e.full_name;

COMMENT ON TABLE employees IS 'Employee management with roles and detailed information';
COMMENT ON TABLE members IS 'Customer card holders (Khách hàng thẻ)';
COMMENT ON TABLE warehouse IS 'Bill storage system (Kho)';
COMMENT ON TABLE transaction_history IS 'Sales transaction history';
COMMENT ON TABLE work_notes IS 'Employee work notes and performance tracking';
COMMENT ON TABLE audit_log IS 'System audit trail for all changes';
COMMENT ON TABLE system_settings IS 'Application configuration settings';