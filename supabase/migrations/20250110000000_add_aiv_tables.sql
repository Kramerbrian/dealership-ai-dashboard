-- Create AIV Weekly Metrics Table
CREATE TABLE IF NOT EXISTS aiv_weekly (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id TEXT NOT NULL,
    aiv_score INTEGER NOT NULL CHECK (aiv_score >= 0 AND aiv_score <= 100),
    ati_score INTEGER NOT NULL CHECK (ati_score >= 0 AND ati_score <= 100),
    crs_score INTEGER NOT NULL CHECK (crs_score >= 0 AND crs_score <= 100),
    elasticity_usd_per_pt DECIMAL(10,2) NOT NULL CHECK (elasticity_usd_per_pt >= 0),
    r2_coefficient DECIMAL(5,4) NOT NULL CHECK (r2_coefficient >= 0 AND r2_coefficient <= 1),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_aiv_weekly_dealer_id ON aiv_weekly(dealer_id);
CREATE INDEX IF NOT EXISTS idx_aiv_weekly_timestamp ON aiv_weekly(timestamp);
CREATE INDEX IF NOT EXISTS idx_aiv_weekly_dealer_timestamp ON aiv_weekly(dealer_id, timestamp DESC);

-- Create unique constraint to prevent duplicate entries for same dealer and timestamp
CREATE UNIQUE INDEX IF NOT EXISTS idx_aiv_weekly_dealer_timestamp_unique 
ON aiv_weekly(dealer_id, DATE_TRUNC('week', timestamp));

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    changes JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Create dealer access table for RBAC
CREATE TABLE IF NOT EXISTS dealer_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    dealer_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for dealer access
CREATE INDEX IF NOT EXISTS idx_dealer_access_user_id ON dealer_access(user_id);
CREATE INDEX IF NOT EXISTS idx_dealer_access_dealer_id ON dealer_access(dealer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dealer_access_user_dealer ON dealer_access(user_id, dealer_id);

-- Create dealers table (if not exists)
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

-- Enable Row Level Security
ALTER TABLE aiv_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for aiv_weekly
CREATE POLICY "Users can view their dealer's AIV data" ON aiv_weekly
    FOR SELECT USING (
        dealer_id IN (
            SELECT dealer_id FROM dealer_access 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert AIV data for their dealers" ON aiv_weekly
    FOR INSERT WITH CHECK (
        dealer_id IN (
            SELECT dealer_id FROM dealer_access 
            WHERE user_id = auth.uid() AND role IN ('admin', 'user')
        )
    );

CREATE POLICY "Users can update AIV data for their dealers" ON aiv_weekly
    FOR UPDATE USING (
        dealer_id IN (
            SELECT dealer_id FROM dealer_access 
            WHERE user_id = auth.uid() AND role IN ('admin', 'user')
        )
    );

-- Create RLS policies for audit_log
CREATE POLICY "Users can view their own audit logs" ON audit_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for dealer_access
CREATE POLICY "Users can view their own dealer access" ON dealer_access
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage dealer access" ON dealer_access
    FOR ALL USING (
        user_id = auth.uid() AND role = 'admin'
    );

-- Create RLS policies for dealers
CREATE POLICY "Users can view dealers they have access to" ON dealers
    FOR SELECT USING (
        id IN (
            SELECT dealer_id FROM dealer_access 
            WHERE user_id = auth.uid()
        )
    );

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

CREATE TRIGGER update_dealer_access_updated_at 
    BEFORE UPDATE ON dealer_access 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at 
    BEFORE UPDATE ON dealers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO dealers (id, name, city, state, brand, website) VALUES
    ('demo-dealer', 'Demo Dealership', 'Naples', 'FL', 'Honda', 'https://demo-dealership.com'),
    ('test-dealer', 'Test Auto Group', 'Miami', 'FL', 'Toyota', 'https://test-autogroup.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample dealer access (you'll need to replace with real user IDs)
-- INSERT INTO dealer_access (user_id, dealer_id, role) VALUES
--     ('your-user-id-here', 'demo-dealer', 'admin'),
--     ('your-user-id-here', 'test-dealer', 'user')
-- ON CONFLICT (user_id, dealer_id) DO NOTHING;

-- Insert sample AIV data
INSERT INTO aiv_weekly (dealer_id, aiv_score, ati_score, crs_score, elasticity_usd_per_pt, r2_coefficient, metadata) VALUES
    ('demo-dealer', 42, 38, 35, 1250.00, 0.87, '{"query_count": 1, "confidence_score": 0.85, "recommendations": ["Improve local SEO presence", "Increase review response rate", "Optimize for voice search queries"]}'),
    ('test-dealer', 58, 52, 48, 1850.00, 0.91, '{"query_count": 1, "confidence_score": 0.88, "recommendations": ["Enhance content marketing", "Improve citation consistency", "Optimize for featured snippets"]}')
ON CONFLICT (dealer_id, DATE_TRUNC('week', timestamp)) DO NOTHING;
