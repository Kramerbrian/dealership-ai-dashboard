-- Fix RLS permissions for service role
-- This allows the service role key to bypass RLS for testing and admin operations

-- Disable RLS temporarily for service role access
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE dealership_data FORCE ROW LEVEL SECURITY;
ALTER TABLE ai_query_results FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE api_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE notification_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE review_templates FORCE ROW LEVEL SECURITY;

-- Add policies that allow service role to bypass RLS
CREATE POLICY "Service role can do anything on tenants" ON tenants
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on dealership_data" ON dealership_data
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on ai_query_results" ON ai_query_results
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on api_keys" ON api_keys
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on notification_settings" ON notification_settings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on reviews" ON reviews
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything on review_templates" ON review_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Grant all privileges to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

SELECT 'RLS permissions fixed! Service role can now access all tables.' AS status;
