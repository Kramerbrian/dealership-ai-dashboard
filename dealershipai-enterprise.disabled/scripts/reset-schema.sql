-- Reset Database Schema
-- This will drop all existing tables and recreate them

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS api_usage CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS market_analysis CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;
DROP TABLE IF EXISTS score_history CASCADE;
DROP TABLE IF EXISTS dealership_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS review_sentiment CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS tenant_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now run the clean schema
-- (Copy the content from clean-schema.sql here)
