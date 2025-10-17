-- ATI (Algorithmic Trust Index) Signals Schema
-- Comprehensive trust metrics tracking for DealershipAI

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ATI Signals Table
CREATE TABLE ati_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    date_week DATE NOT NULL,
    
    -- Core ATI Components (0-100 scale)
    precision_pct DECIMAL(5,2) CHECK (precision_pct >= 0 AND precision_pct <= 100),
    consistency_pct DECIMAL(5,2) CHECK (consistency_pct >= 0 AND consistency_pct <= 100),
    recency_pct DECIMAL(5,2) CHECK (recency_pct >= 0 AND recency_pct <= 100),
    authenticity_pct DECIMAL(5,2) CHECK (authenticity_pct >= 0 AND authenticity_pct <= 100),
    alignment_pct DECIMAL(5,2) CHECK (alignment_pct >= 0 AND alignment_pct <= 100),
    
    -- Calculated ATI Score
    ati_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        (precision_pct * 0.25 + 
         consistency_pct * 0.25 + 
         recency_pct * 0.20 + 
         authenticity_pct * 0.20 + 
         alignment_pct * 0.10)
    ) STORED,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, date_week),
    
    -- Indexes for performance
    INDEX idx_ati_tenant_date ON ati_signals(tenant_id, date_week DESC),
    INDEX idx_ati_date ON ati_signals(date_week DESC),
    INDEX idx_ati_score ON ati_signals(ati_pct DESC)
);

-- ATI Component Details Table (for granular tracking)
CREATE TABLE ati_component_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ati_signal_id UUID REFERENCES ati_signals(id) ON DELETE CASCADE,
    component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('precision', 'consistency', 'recency', 'authenticity', 'alignment')),
    
    -- Component-specific metrics
    raw_score DECIMAL(5,2),
    normalized_score DECIMAL(5,2),
    weight DECIMAL(3,2) DEFAULT 1.0,
    
    -- Detailed breakdown
    metrics JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_ati_component_signal ON ati_component_details(ati_signal_id),
    INDEX idx_ati_component_type ON ati_component_details(component_type)
);

-- ATI Trends Table (for historical analysis)
CREATE TABLE ati_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    trend_period VARCHAR(10) NOT NULL CHECK (trend_period IN ('weekly', 'monthly', 'quarterly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Trend metrics
    avg_ati_pct DECIMAL(5,2),
    min_ati_pct DECIMAL(5,2),
    max_ati_pct DECIMAL(5,2),
    trend_direction VARCHAR(10) CHECK (trend_direction IN ('up', 'down', 'stable')),
    trend_magnitude DECIMAL(5,2),
    
    -- Component trends
    precision_trend DECIMAL(5,2),
    consistency_trend DECIMAL(5,2),
    recency_trend DECIMAL(5,2),
    authenticity_trend DECIMAL(5,2),
    alignment_trend DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, trend_period, period_start),
    
    -- Indexes
    INDEX idx_ati_trends_tenant ON ati_trends(tenant_id, trend_period, period_start DESC)
);

-- ATI Benchmarks Table (for competitive analysis)
CREATE TABLE ati_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    benchmark_type VARCHAR(20) NOT NULL CHECK (benchmark_type IN ('industry', 'regional', 'tier', 'custom')),
    benchmark_scope VARCHAR(50),
    date_week DATE NOT NULL,
    
    -- Benchmark metrics
    avg_ati_pct DECIMAL(5,2),
    median_ati_pct DECIMAL(5,2),
    p25_ati_pct DECIMAL(5,2),
    p75_ati_pct DECIMAL(5,2),
    p90_ati_pct DECIMAL(5,2),
    
    -- Component benchmarks
    avg_precision_pct DECIMAL(5,2),
    avg_consistency_pct DECIMAL(5,2),
    avg_recency_pct DECIMAL(5,2),
    avg_authenticity_pct DECIMAL(5,2),
    avg_alignment_pct DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(benchmark_type, benchmark_scope, date_week),
    
    -- Indexes
    INDEX idx_ati_benchmarks_type ON ati_benchmarks(benchmark_type, date_week DESC)
);

-- ATI Alerts Table (for monitoring and notifications)
CREATE TABLE ati_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('threshold', 'trend', 'anomaly', 'improvement')),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Alert details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    current_value DECIMAL(5,2),
    threshold_value DECIMAL(5,2),
    component VARCHAR(20),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_ati_alerts_tenant ON ati_alerts(tenant_id, status, created_at DESC),
    INDEX idx_ati_alerts_severity ON ati_alerts(severity, status)
);

-- Views for easy querying
CREATE VIEW ati_current_scores AS
SELECT 
    s.tenant_id,
    s.date_week,
    s.precision_pct,
    s.consistency_pct,
    s.recency_pct,
    s.authenticity_pct,
    s.alignment_pct,
    s.ati_pct,
    s.created_at,
    s.updated_at
FROM ati_signals s
WHERE s.date_week = (
    SELECT MAX(date_week) 
    FROM ati_signals s2 
    WHERE s2.tenant_id = s.tenant_id
);

CREATE VIEW ati_performance_summary AS
SELECT 
    s.tenant_id,
    COUNT(*) as total_weeks,
    AVG(s.ati_pct) as avg_ati_pct,
    MIN(s.ati_pct) as min_ati_pct,
    MAX(s.ati_pct) as max_ati_pct,
    STDDEV(s.ati_pct) as ati_volatility,
    AVG(s.precision_pct) as avg_precision_pct,
    AVG(s.consistency_pct) as avg_consistency_pct,
    AVG(s.recency_pct) as avg_recency_pct,
    AVG(s.authenticity_pct) as avg_authenticity_pct,
    AVG(s.alignment_pct) as avg_alignment_pct,
    MAX(s.date_week) as latest_week,
    MIN(s.date_week) as earliest_week
FROM ati_signals s
GROUP BY s.tenant_id;

-- Functions for ATI calculations
CREATE OR REPLACE FUNCTION calculate_ati_trend(
    p_tenant_id UUID,
    p_weeks INTEGER DEFAULT 4
) RETURNS TABLE (
    trend_direction VARCHAR(10),
    trend_magnitude DECIMAL(5,2),
    current_ati DECIMAL(5,2),
    previous_ati DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_scores AS (
        SELECT 
            ati_pct,
            ROW_NUMBER() OVER (ORDER BY date_week DESC) as rn
        FROM ati_signals
        WHERE tenant_id = p_tenant_id
        ORDER BY date_week DESC
        LIMIT p_weeks
    )
    SELECT 
        CASE 
            WHEN current.ati_pct > previous.ati_pct THEN 'up'
            WHEN current.ati_pct < previous.ati_pct THEN 'down'
            ELSE 'stable'
        END::VARCHAR(10) as trend_direction,
        (current.ati_pct - previous.ati_pct)::DECIMAL(5,2) as trend_magnitude,
        current.ati_pct::DECIMAL(5,2) as current_ati,
        previous.ati_pct::DECIMAL(5,2) as previous_ati
    FROM 
        (SELECT ati_pct FROM recent_scores WHERE rn = 1) current,
        (SELECT ati_pct FROM recent_scores WHERE rn = 2) previous;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ATI alerts
CREATE OR REPLACE FUNCTION generate_ati_alerts(p_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
    current_ati DECIMAL(5,2);
    industry_avg DECIMAL(5,2);
    trend_direction VARCHAR(10);
    trend_magnitude DECIMAL(5,2);
BEGIN
    -- Get current ATI score
    SELECT ati_pct INTO current_ati
    FROM ati_current_scores
    WHERE tenant_id = p_tenant_id;
    
    -- Get industry average
    SELECT AVG(ati_pct) INTO industry_avg
    FROM ati_benchmarks
    WHERE benchmark_type = 'industry'
    AND date_week = (SELECT MAX(date_week) FROM ati_benchmarks WHERE benchmark_type = 'industry');
    
    -- Get trend information
    SELECT trend_direction, trend_magnitude INTO trend_direction, trend_magnitude
    FROM calculate_ati_trend(p_tenant_id, 4);
    
    -- Generate alerts based on conditions
    IF current_ati < industry_avg - 10 THEN
        INSERT INTO ati_alerts (tenant_id, alert_type, severity, title, description, current_value, threshold_value)
        VALUES (p_tenant_id, 'threshold', 'high', 'ATI Below Industry Average', 
                'Your ATI score is significantly below the industry average. Consider focusing on trust-building initiatives.',
                current_ati, industry_avg);
    END IF;
    
    IF trend_direction = 'down' AND ABS(trend_magnitude) > 5 THEN
        INSERT INTO ati_alerts (tenant_id, alert_type, severity, title, description, current_value, threshold_value)
        VALUES (p_tenant_id, 'trend', 'medium', 'Declining ATI Trend', 
                'Your ATI score has been declining over the past 4 weeks. Review recent changes that might be impacting trust.',
                current_ati, current_ati + trend_magnitude);
    END IF;
    
    IF trend_direction = 'up' AND trend_magnitude > 5 THEN
        INSERT INTO ati_alerts (tenant_id, alert_type, severity, title, description, current_value, threshold_value)
        VALUES (p_tenant_id, 'improvement', 'low', 'ATI Improvement Detected', 
                'Great job! Your ATI score has improved significantly over the past 4 weeks.',
                current_ati, current_ati - trend_magnitude);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE ati_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ati_component_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE ati_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ati_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ati_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY ati_signals_tenant_isolation ON ati_signals
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY ati_component_details_tenant_isolation ON ati_component_details
    FOR ALL USING (
        ati_signal_id IN (
            SELECT id FROM ati_signals 
            WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
        )
    );

CREATE POLICY ati_trends_tenant_isolation ON ati_trends
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY ati_benchmarks_public_read ON ati_benchmarks
    FOR SELECT USING (true);

CREATE POLICY ati_alerts_tenant_isolation ON ati_alerts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Insert sample data for Lou Grubbs Auto
INSERT INTO ati_signals (
    tenant_id,
    date_week,
    precision_pct,
    consistency_pct,
    recency_pct,
    authenticity_pct,
    alignment_pct
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '2025-01-13',
    87.50,
    92.30,
    78.90,
    81.20,
    85.60
) ON CONFLICT (tenant_id, date_week) DO UPDATE SET
    precision_pct = EXCLUDED.precision_pct,
    consistency_pct = EXCLUDED.consistency_pct,
    recency_pct = EXCLUDED.recency_pct,
    authenticity_pct = EXCLUDED.authenticity_pct,
    alignment_pct = EXCLUDED.alignment_pct,
    updated_at = now();

-- Insert additional historical data for trend analysis
INSERT INTO ati_signals (tenant_id, date_week, precision_pct, consistency_pct, recency_pct, authenticity_pct, alignment_pct) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2025-01-06', 85.20, 90.10, 76.50, 79.80, 83.40),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2024-12-30', 83.70, 88.90, 74.20, 77.60, 81.80),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2024-12-23', 82.10, 87.30, 72.80, 75.40, 80.20),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2024-12-16', 80.50, 85.70, 71.20, 73.80, 78.60);

-- Insert industry benchmarks
INSERT INTO ati_benchmarks (benchmark_type, benchmark_scope, date_week, avg_ati_pct, median_ati_pct, p25_ati_pct, p75_ati_pct, p90_ati_pct, avg_precision_pct, avg_consistency_pct, avg_recency_pct, avg_authenticity_pct, avg_alignment_pct) VALUES
('industry', 'automotive', '2025-01-13', 75.20, 76.80, 68.40, 82.10, 88.50, 74.30, 78.90, 72.10, 76.80, 74.20),
('industry', 'automotive', '2025-01-06', 74.80, 76.50, 68.10, 81.80, 88.20, 74.10, 78.60, 71.80, 76.50, 73.90);

-- Generate initial alerts
SELECT generate_ati_alerts('f47ac10b-58cc-4372-a567-0e02b2c3d479');
