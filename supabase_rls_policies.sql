-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- Bill Lookup System - Role-based Access Control
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM employees WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user exists and is active
CREATE OR REPLACE FUNCTION is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM employees 
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. EMPLOYEES TABLE POLICIES
-- =====================================================

-- Admin can do everything with employees
CREATE POLICY "Admin full access to employees"
ON employees
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can read all active employees (for dropdowns, etc.)
CREATE POLICY "Users can read active employees"
ON employees
FOR SELECT
TO authenticated
USING (is_active = true AND is_active_user());

-- Users can update their own profile (except role and sensitive fields)
CREATE POLICY "Users can update own profile"
ON employees
FOR UPDATE
TO authenticated
USING (id = auth.uid() AND is_active_user())
WITH CHECK (
  id = auth.uid() AND 
  is_active_user() AND
  -- Prevent users from changing their own role or sensitive fields
  role = (SELECT role FROM employees WHERE id = auth.uid()) AND
  is_active = (SELECT is_active FROM employees WHERE id = auth.uid())
);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON employees
FOR SELECT
TO authenticated
USING (id = auth.uid() AND is_active_user());

-- =====================================================
-- 4. MEMBERS TABLE POLICIES
-- =====================================================

-- Admin has full access to members
CREATE POLICY "Admin full access to members"
ON members
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can read active members
CREATE POLICY "Users can read active members"
ON members
FOR SELECT
TO authenticated
USING (is_active = true AND is_active_user());

-- Users cannot modify members (only admin can)
-- This is enforced by not having INSERT/UPDATE/DELETE policies for non-admins

-- =====================================================
-- 5. WAREHOUSE TABLE POLICIES
-- =====================================================

-- Admin has full access to warehouse
CREATE POLICY "Admin full access to warehouse"
ON warehouse
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can read warehouse items
CREATE POLICY "Users can read warehouse"
ON warehouse
FOR SELECT
TO authenticated
USING (is_active_user());

-- Users can insert new items into warehouse (import bills)
CREATE POLICY "Users can import to warehouse"
ON warehouse
FOR INSERT
TO authenticated
WITH CHECK (
  is_active_user() AND
  created_by = auth.uid() AND
  status = 'available'
);

-- Users can update warehouse items they created (limited fields)
CREATE POLICY "Users can update own warehouse items"
ON warehouse
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() AND 
  is_active_user() AND
  status = 'available'
)
WITH CHECK (
  created_by = auth.uid() AND 
  is_active_user() AND
  -- Users can only update exported_at and status for sales
  (status IN ('available', 'sold')) AND
  updated_by = auth.uid()
);

-- =====================================================
-- 6. TRANSACTION_HISTORY TABLE POLICIES
-- =====================================================

-- Admin has full access to transaction history
CREATE POLICY "Admin full access to transaction_history"
ON transaction_history
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can read all transaction history
CREATE POLICY "Users can read transaction_history"
ON transaction_history
FOR SELECT
TO authenticated
USING (is_active_user());

-- Users can insert their own transactions
CREATE POLICY "Users can create transactions"
ON transaction_history
FOR INSERT
TO authenticated
WITH CHECK (
  is_active_user() AND
  employee_id = auth.uid() AND
  created_by = auth.uid()
);

-- Users cannot update or delete transaction history
-- This ensures data integrity for sales records

-- =====================================================
-- 7. WORK_NOTES TABLE POLICIES
-- =====================================================

-- Admin has full access to work notes
CREATE POLICY "Admin full access to work_notes"
ON work_notes
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can read non-private notes about themselves
CREATE POLICY "Users can read own non-private notes"
ON work_notes
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() AND 
  is_private = false AND 
  is_active_user()
);

-- Users cannot create, update, or delete work notes
-- Only admins can manage work notes

-- =====================================================
-- 8. AUDIT_LOG TABLE POLICIES
-- =====================================================

-- Only admin can read audit logs
CREATE POLICY "Admin can read audit_log"
ON audit_log
FOR SELECT
TO authenticated
USING (is_admin());

-- System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit_log"
ON audit_log
FOR INSERT
TO authenticated
WITH CHECK (true); -- This will be controlled by triggers

-- No one can update or delete audit logs
-- This ensures audit trail integrity

-- =====================================================
-- 9. SYSTEM_SETTINGS TABLE POLICIES
-- =====================================================

-- Admin has full access to system settings
CREATE POLICY "Admin full access to system_settings"
ON system_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can read public settings only
CREATE POLICY "Users can read public settings"
ON system_settings
FOR SELECT
TO authenticated
USING (is_public = true AND is_active_user());

-- =====================================================
-- 10. AUDIT TRIGGER FUNCTIONS
-- =====================================================

-- Function to log changes to audit_log
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip audit logging for audit_log table itself
  IF TG_TABLE_NAME = 'audit_log' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Insert audit record
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id,
    user_email
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    auth.email()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. APPLY AUDIT TRIGGERS
-- =====================================================

-- Create audit triggers for all main tables
CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_members
  AFTER INSERT OR UPDATE OR DELETE ON members
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_warehouse
  AFTER INSERT OR UPDATE OR DELETE ON warehouse
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_transaction_history
  AFTER INSERT OR UPDATE OR DELETE ON transaction_history
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_work_notes
  AFTER INSERT OR UPDATE OR DELETE ON work_notes
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_system_settings
  AFTER INSERT OR UPDATE OR DELETE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- =====================================================
-- 12. ADDITIONAL SECURITY FUNCTIONS
-- =====================================================

-- Function to validate bill import data
CREATE OR REPLACE FUNCTION validate_bill_import(
  p_account TEXT,
  p_provider_id TEXT,
  p_total NUMERIC
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic validation rules
  IF p_account IS NULL OR LENGTH(p_account) < 5 THEN
    RETURN FALSE;
  END IF;
  
  IF p_provider_id IS NULL OR LENGTH(p_provider_id) < 5 THEN
    RETURN FALSE;
  END IF;
  
  IF p_total < 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can sell bills
CREATE OR REPLACE FUNCTION can_sell_bills(p_warehouse_ids UUID[])
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is active
  IF NOT is_active_user() THEN
    RETURN FALSE;
  END IF;
  
  -- Admin can sell any bills
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Users can only sell bills they imported or available bills
  RETURN NOT EXISTS(
    SELECT 1 FROM warehouse 
    WHERE id = ANY(p_warehouse_ids) 
    AND (status != 'available' OR exported_at IS NOT NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create partial indexes for better RLS performance
CREATE INDEX IF NOT EXISTS idx_employees_auth_uid ON employees(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_warehouse_created_by ON warehouse(created_by) WHERE status = 'available';
CREATE INDEX IF NOT EXISTS idx_transaction_history_employee ON transaction_history(employee_id);

-- =====================================================
-- 14. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION is_admin() IS 'Checks if current user has admin role';
COMMENT ON FUNCTION is_active_user() IS 'Checks if current user exists and is active';
COMMENT ON FUNCTION validate_bill_import(TEXT, TEXT, NUMERIC) IS 'Validates bill import data before insertion';
COMMENT ON FUNCTION can_sell_bills(UUID[]) IS 'Checks if user can sell the specified bills';
COMMENT ON FUNCTION log_audit_changes() IS 'Logs all table changes to audit_log table';

-- =====================================================
-- 15. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_active_user() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_bill_import(TEXT, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION can_sell_bills(UUID[]) TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant select on views
GRANT SELECT ON active_warehouse TO authenticated;
GRANT SELECT ON transaction_history_detailed TO authenticated;
GRANT SELECT ON employee_performance TO authenticated;