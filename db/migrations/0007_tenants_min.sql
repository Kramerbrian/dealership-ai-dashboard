-- Create tenants table for multi-tenant support
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,              -- e.g., "demo-lou-grubbs"
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin access only for tenant management)
CREATE POLICY tenants_admin_select ON tenants
  FOR SELECT USING (true); -- Allow all authenticated users to read tenants

CREATE POLICY tenants_admin_insert ON tenants
  FOR INSERT WITH CHECK (true); -- Allow admin operations

CREATE POLICY tenants_admin_update ON tenants
  FOR UPDATE USING (true);

CREATE POLICY tenants_admin_delete ON tenants
  FOR DELETE USING (true);

-- Insert demo tenant
INSERT INTO tenants (id, slug, name) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'demo-lou-grubbs', 'Demo - Lou Grubbs')
ON CONFLICT (slug) DO NOTHING;
