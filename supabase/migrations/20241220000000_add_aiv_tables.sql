-- Create AIV Weekly Metrics Table
CREATE TABLE IF NOT EXISTS aiv_weekly (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id TEXT NOT NULL,
    aiv_score INTEGER NOT NULL DEFAULT 0 CHECK (aiv_score >= 0 AND aiv_score <= 100),
    ati_score INTEGER NOT NULL DEFAULT 0 CHECK (ati_score >= 0 AND ati_score <= 100),
    crs_score INTEGER NOT NULL DEFAULT 0 CHECK (crs_score >= 0 AND crs_score <= 100),
    elasticity_usd_per_pt DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    r2_coefficient DECIMAL(5,4) NOT NULL DEFAULT 0.0000 CHECK (r2_coefficient >= 0 AND r2_coefficient <= 1),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_aiv_weekly_dealer_timestamp ON aiv_weekly(dealer_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_aiv_weekly_timestamp ON aiv_weekly(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_aiv_weekly_dealer_id ON aiv_weekly(dealer_id);

-- Create immutable function for week truncation
CREATE OR REPLACE FUNCTION date_trunc_week_immutable(timestamptz)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT date_trunc('week', $1);
$$;

-- Create unique constraint to prevent duplicate entries for same dealer and timestamp
CREATE UNIQUE INDEX IF NOT EXISTS idx_aiv_weekly_unique_dealer_timestamp 
ON aiv_weekly(dealer_id, date_trunc_week_immutable(timestamp));

-- Create dealers table if it doesn't exist
CREATE TABLE IF NOT EXISTS dealers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    brand TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dealer_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS dealer_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    dealer_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'dealership_admin', 'enterprise_admin', 'superadmin')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, dealer_id)
);

-- Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    changes JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE aiv_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aiv_weekly
CREATE POLICY "Users can view AIV metrics for their dealers" ON aiv_weekly
    FOR SELECT USING (
        dealer_id IN (
            SELECT dealer_id FROM dealer_access 
            WHERE user_id = auth.uid() AND active = TRUE
        )
    );

CREATE POLICY "Admins can insert AIV metrics" ON aiv_weekly
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM dealer_access 
            WHERE user_id = auth.uid() 
            AND dealer_id = aiv_weekly.dealer_id 
            AND role IN ('dealership_admin', 'enterprise_admin', 'superadmin')
            AND active = TRUE
        )
    );

CREATE POLICY "Admins can update AIV metrics" ON aiv_weekly
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM dealer_access 
            WHERE user_id = auth.uid() 
            AND dealer_id = aiv_weekly.dealer_id 
            AND role IN ('dealership_admin', 'enterprise_admin', 'superadmin')
            AND active = TRUE
        )
    );

-- RLS Policies for dealers
CREATE POLICY "Users can view dealers they have access to" ON dealers
    FOR SELECT USING (
        id IN (
            SELECT dealer_id FROM dealer_access 
            WHERE user_id = auth.uid() AND active = TRUE
        )
    );

-- RLS Policies for dealer_access
CREATE POLICY "Users can view their own access" ON dealer_access
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage dealer access" ON dealer_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM dealer_access da
            WHERE da.user_id = auth.uid() 
            AND da.dealer_id = dealer_access.dealer_id
            AND da.role IN ('enterprise_admin', 'superadmin')
            AND da.active = TRUE
        )
    );

-- RLS Policies for audit_log
CREATE POLICY "Users can view their own audit logs" ON audit_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_aiv_weekly_updated_at 
    BEFORE UPDATE ON aiv_weekly 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at 
    BEFORE UPDATE ON dealers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_access_updated_at 
    BEFORE UPDATE ON dealer_access 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO dealers (id, name, city, state, brand, website) VALUES
    ('demo-dealer', 'Demo Dealership', 'Naples', 'FL', 'Toyota', 'https://demo-dealer.com'),
    ('test-dealer', 'Test Auto Group', 'Miami', 'FL', 'Honda', 'https://test-dealer.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample AIV metrics
INSERT INTO aiv_weekly (dealer_id, aiv_score, ati_score, crs_score, elasticity_usd_per_pt, r2_coefficient, metadata) VALUES
    ('demo-dealer', 82, 78, 85, 156.30, 0.87, '{"query_count": 160, "confidence_score": 0.89, "recommendations": ["Improve local SEO citations", "Optimize for voice search queries", "Enhance review response rate"]}'),
    ('test-dealer', 67, 72, 64, 142.50, 0.82, '{"query_count": 140, "confidence_score": 0.85, "recommendations": ["Increase AI platform presence", "Improve content quality", "Build more backlinks"]}')
ON CONFLICT (dealer_id, date_trunc_week_immutable(timestamp)) DO NOTHING;

-- Create view for latest AIV metrics
CREATE OR REPLACE VIEW latest_aiv_metrics AS
SELECT DISTINCT ON (dealer_id)
    dealer_id,
    aiv_score,
    ati_score,
    crs_score,
    elasticity_usd_per_pt,
    r2_coefficient,
    timestamp,
    metadata
FROM aiv_weekly
ORDER BY dealer_id, timestamp DESC;

-- Grant permissions
GRANT SELECT ON latest_aiv_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON aiv_weekly TO authenticated;
GRANT SELECT ON dealers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dealer_access TO authenticated;
GRANT INSERT ON audit_log TO authenticated;
