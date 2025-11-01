-- =====================================================
-- SUPABASE AUTHENTICATION SETUP
-- Custom User Roles and JWT Token Configuration
-- =====================================================

-- =====================================================
-- 1. CUSTOM CLAIMS FOR JWT TOKENS
-- =====================================================

-- Function to add custom claims to JWT tokens
CREATE OR REPLACE FUNCTION add_custom_claims(user_id UUID)
RETURNS JSON AS $$
DECLARE
  claims JSON;
  user_role TEXT;
  user_data RECORD;
BEGIN
  -- Get user data from employees table
  SELECT role, username, full_name, is_active
  INTO user_data
  FROM employees 
  WHERE id = user_id;

  -- Build custom claims
  claims := json_build_object(
    'role', COALESCE(user_data.role, 'user'),
    'username', user_data.username,
    'full_name', user_data.full_name,
    'is_active', COALESCE(user_data.is_active, false),
    'app_metadata', json_build_object(
      'provider', 'email',
      'providers', array['email']
    )
  );

  RETURN claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. AUTH HOOKS FOR USER MANAGEMENT
-- =====================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into employees table
  INSERT INTO employees (
    id,
    email,
    username,
    role,
    full_name,
    is_active,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update employees table when auth.users is updated
  UPDATE employees SET
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete: mark as inactive instead of hard delete
  UPDATE employees SET
    is_active = false,
    updated_at = NOW()
  WHERE id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE TRIGGERS FOR AUTH EVENTS
-- =====================================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for user updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_delete();

-- =====================================================
-- 4. CUSTOM AUTH FUNCTIONS
-- =====================================================

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_username TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This function should be called from a secure context
  -- In practice, you'd use Supabase Admin API or Dashboard
  
  -- Generate UUID for new user
  new_user_id := gen_random_uuid();
  
  -- Insert into employees table directly (bypassing auth for setup)
  INSERT INTO employees (
    id,
    email,
    username,
    role,
    full_name,
    is_active,
    created_at
  ) VALUES (
    new_user_id,
    p_email,
    COALESCE(p_username, split_part(p_email, '@', 1)),
    'admin',
    COALESCE(p_full_name, 'Administrator'),
    true,
    NOW()
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only existing admins can promote users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  UPDATE employees 
  SET role = 'admin', updated_at = NOW(), updated_by = auth.uid()
  WHERE id = p_user_id AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to user
CREATE OR REPLACE FUNCTION demote_to_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only existing admins can demote users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;
  
  -- Prevent self-demotion
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  UPDATE employees 
  SET role = 'user', updated_at = NOW(), updated_by = auth.uid()
  WHERE id = p_user_id AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate user
CREATE OR REPLACE FUNCTION deactivate_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can deactivate users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can deactivate users';
  END IF;
  
  -- Prevent self-deactivation
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot deactivate yourself';
  END IF;
  
  UPDATE employees 
  SET is_active = false, updated_at = NOW(), updated_by = auth.uid()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate user
CREATE OR REPLACE FUNCTION reactivate_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can reactivate users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reactivate users';
  END IF;
  
  UPDATE employees 
  SET is_active = true, updated_at = NOW(), updated_by = auth.uid()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. JWT CUSTOM CLAIMS INTEGRATION
-- =====================================================

-- Function to get user claims for JWT
CREATE OR REPLACE FUNCTION get_user_claims(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_claims JSON;
BEGIN
  SELECT json_build_object(
    'sub', e.id,
    'email', e.email,
    'role', e.role,
    'username', e.username,
    'full_name', e.full_name,
    'is_active', e.is_active,
    'aud', 'authenticated',
    'exp', extract(epoch from (now() + interval '1 hour'))::integer,
    'iat', extract(epoch from now())::integer,
    'iss', 'supabase',
    'app_metadata', json_build_object(
      'provider', 'email',
      'providers', array['email'],
      'role', e.role
    ),
    'user_metadata', json_build_object(
      'username', e.username,
      'full_name', e.full_name
    )
  )
  INTO user_claims
  FROM employees e
  WHERE e.id = p_user_id AND e.is_active = true;
  
  RETURN COALESCE(user_claims, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. PASSWORD POLICY FUNCTIONS
-- =====================================================

-- Function to validate password strength
CREATE OR REPLACE FUNCTION validate_password(p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Minimum 8 characters
  IF LENGTH(p_password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one number
  IF p_password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one letter
  IF p_password !~ '[a-zA-Z]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 7. SESSION MANAGEMENT
-- =====================================================

-- Function to log user sessions
CREATE OR REPLACE FUNCTION log_user_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Log session start
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    new_data,
    user_id,
    user_email
  ) VALUES (
    'user_sessions',
    NEW.id,
    'LOGIN',
    json_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'last_sign_in_at', NEW.last_sign_in_at,
      'sign_in_count', NEW.sign_in_count
    ),
    NEW.id,
    NEW.email
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for session logging
CREATE TRIGGER log_auth_sessions
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION log_user_session();

-- =====================================================
-- 8. SECURITY POLICIES FOR AUTH
-- =====================================================

-- Function to check if email domain is allowed
CREATE OR REPLACE FUNCTION is_email_domain_allowed(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  allowed_domains TEXT[];
  email_domain TEXT;
BEGIN
  -- Get allowed domains from system settings
  SELECT setting_value::jsonb INTO allowed_domains
  FROM system_settings
  WHERE setting_key = 'allowed_email_domains';
  
  -- If no restriction is set, allow all domains
  IF allowed_domains IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Extract domain from email
  email_domain := split_part(p_email, '@', 2);
  
  -- Check if domain is in allowed list
  RETURN email_domain = ANY(allowed_domains);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. INITIAL SETUP DATA
-- =====================================================

-- Insert auth-related system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('password_min_length', '8', 'Minimum password length', false),
('session_timeout_hours', '24', 'Session timeout in hours', false),
('max_login_attempts', '5', 'Maximum login attempts before lockout', false),
('lockout_duration_minutes', '30', 'Account lockout duration in minutes', false),
('require_email_verification', 'true', 'Require email verification for new accounts', false),
('allowed_email_domains', 'null', 'Allowed email domains (null = all allowed)', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 10. UTILITY FUNCTIONS
-- =====================================================

-- Function to get current user info
CREATE OR REPLACE FUNCTION get_current_user_info()
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  role TEXT,
  full_name TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.email, e.username, e.role, e.full_name, e.is_active
  FROM employees e
  WHERE e.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION has_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin has all permissions
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Define user permissions
  CASE p_permission
    WHEN 'read_warehouse' THEN RETURN is_active_user();
    WHEN 'import_bills' THEN RETURN is_active_user();
    WHEN 'sell_bills' THEN RETURN is_active_user();
    WHEN 'read_members' THEN RETURN is_active_user();
    WHEN 'manage_members' THEN RETURN is_admin();
    WHEN 'manage_employees' THEN RETURN is_admin();
    WHEN 'view_audit_logs' THEN RETURN is_admin();
    WHEN 'manage_settings' THEN RETURN is_admin();
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on auth functions
GRANT EXECUTE ON FUNCTION add_custom_claims(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_claims(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_domain_allowed(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_info() TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(TEXT) TO authenticated;

-- Admin-only functions
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION promote_to_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_to_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_user(UUID) TO authenticated;

-- =====================================================
-- 12. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION add_custom_claims(UUID) IS 'Adds custom claims to JWT tokens for role-based access';
COMMENT ON FUNCTION handle_new_user() IS 'Handles new user registration by creating employee record';
COMMENT ON FUNCTION handle_user_update() IS 'Syncs auth.users updates to employees table';
COMMENT ON FUNCTION handle_user_delete() IS 'Handles user deletion by soft-deleting employee record';
COMMENT ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT) IS 'Creates a new admin user (service role only)';
COMMENT ON FUNCTION promote_to_admin(UUID) IS 'Promotes a user to admin role';
COMMENT ON FUNCTION demote_to_user(UUID) IS 'Demotes an admin to user role';
COMMENT ON FUNCTION validate_password(TEXT) IS 'Validates password strength according to policy';
COMMENT ON FUNCTION get_current_user_info() IS 'Returns current authenticated user information';
COMMENT ON FUNCTION has_permission(TEXT) IS 'Checks if current user has specific permission';