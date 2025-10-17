-- DTRI (Dealership Trust & Revenue Intelligence) Database Schema
-- Supports multi-tenant architecture with comprehensive analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- DTRI Analysis Results Table
CREATE TABLE dtri_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('comprehensive', 'trust', 'elasticity', 'performance')),
    results JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_dtri_dealer_tenant ON dtri_analysis_results(dealer_id, tenant_id),
    INDEX idx_dtri_analysis_type ON dtri_analysis_results(analysis_type),
    INDEX idx_dtri_created_at ON dtri_analysis_results(created_at DESC),
    INDEX idx_dtri_confidence ON dtri_analysis_results(confidence_score DESC)
);

-- Trust Metrics Results Table
CREATE TABLE trust_metrics_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    time_range VARCHAR(10) NOT NULL CHECK (time_range IN ('7d', '30d', '90d', '1y')),
    trust_metrics JSONB NOT NULL,
    overall_trust_score DECIMAL(5,2) CHECK (overall_trust_score >= 0 AND overall_trust_score <= 100),
    trust_trend VARCHAR(10) CHECK (trust_trend IN ('up', 'down', 'stable')),
    trust_change DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_trust_dealer_tenant ON trust_metrics_results(dealer_id, tenant_id),
    INDEX idx_trust_time_range ON trust_metrics_results(time_range),
    INDEX idx_trust_score ON trust_metrics_results(overall_trust_score DESC),
    INDEX idx_trust_created_at ON trust_metrics_results(created_at DESC)
);

-- Elasticity Analysis Results Table
CREATE TABLE elasticity_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('weekly', 'monthly', 'quarterly')),
    elasticity_analysis JSONB NOT NULL,
    elasticity_coefficient DECIMAL(8,4),
    r_squared DECIMAL(5,4) CHECK (r_squared >= 0 AND r_squared <= 1),
    confidence_level VARCHAR(10) CHECK (confidence_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_elasticity_dealer_tenant ON elasticity_results(dealer_id, tenant_id),
    INDEX idx_elasticity_time_period ON elasticity_results(time_period),
    INDEX idx_elasticity_coefficient ON elasticity_results(elasticity_coefficient DESC),
    INDEX idx_elasticity_created_at ON elasticity_results(created_at DESC)
);

-- Performance Issues Tracking Table
CREATE TABLE performance_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    threshold_value DECIMAL(10,2),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'ignored')),
    
    -- Indexes
    INDEX idx_performance_dealer_tenant ON performance_issues(dealer_id, tenant_id),
    INDEX idx_performance_severity ON performance_issues(severity),
    INDEX idx_performance_status ON performance_issues(status),
    INDEX idx_performance_detected_at ON performance_issues(detected_at DESC)
);

-- Enhancement Recommendations Table
CREATE TABLE enhancement_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    actions JSONB NOT NULL,
    expected_impact VARCHAR(255),
    timeline VARCHAR(100),
    cost_estimate VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_enhancement_dealer_tenant ON enhancement_recommendations(dealer_id, tenant_id),
    INDEX idx_enhancement_priority ON enhancement_recommendations(priority),
    INDEX idx_enhancement_status ON enhancement_recommendations(status),
    INDEX idx_enhancement_created_at ON enhancement_recommendations(created_at DESC)
);

-- Job Queue Status Table (for monitoring BullMQ jobs)
CREATE TABLE job_queue_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_name VARCHAR(50) NOT NULL,
    job_id VARCHAR(255) NOT NULL,
    dealer_id UUID,
    tenant_id UUID,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('waiting', 'active', 'completed', 'failed', 'delayed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_job_queue_name ON job_queue_status(queue_name),
    INDEX idx_job_dealer_tenant ON job_queue_status(dealer_id, tenant_id),
    INDEX idx_job_status ON job_queue_status(status),
    INDEX idx_job_created_at ON job_queue_status(created_at DESC)
);

-- Analytics Views for Dashboard
CREATE VIEW dtri_analytics_summary AS
SELECT 
    d.id as dealer_id,
    d.name as dealer_name,
    d.tier,
    d.city,
    d.state,
    dar.analysis_type,
    dar.confidence_score,
    dar.processing_time_ms,
    dar.created_at as last_analysis,
    tmr.overall_trust_score,
    tmr.trust_trend,
    er.elasticity_coefficient,
    er.r_squared,
    er.confidence_level,
    COUNT(DISTINCT pi.id) as open_issues,
    COUNT(DISTINCT enr.id) as pending_recommendations
FROM dealers d
LEFT JOIN dtri_analysis_results dar ON d.id = dar.dealer_id
LEFT JOIN trust_metrics_results tmr ON d.id = tmr.dealer_id
LEFT JOIN elasticity_results er ON d.id = er.dealer_id
LEFT JOIN performance_issues pi ON d.id = pi.dealer_id AND pi.status = 'open'
LEFT JOIN enhancement_recommendations enr ON d.id = enr.dealer_id AND enr.status = 'pending'
GROUP BY d.id, d.name, d.tier, d.city, d.state, dar.analysis_type, dar.confidence_score, 
         dar.processing_time_ms, dar.created_at, tmr.overall_trust_score, tmr.trust_trend,
         er.elasticity_coefficient, er.r_squared, er.confidence_level;

-- Trust Score Trends View
CREATE VIEW trust_score_trends AS
SELECT 
    dealer_id,
    tenant_id,
    DATE_TRUNC('day', created_at) as date,
    AVG(overall_trust_score) as avg_trust_score,
    COUNT(*) as analysis_count,
    MAX(overall_trust_score) as max_trust_score,
    MIN(overall_trust_score) as min_trust_score
FROM trust_metrics_results
GROUP BY dealer_id, tenant_id, DATE_TRUNC('day', created_at)
ORDER BY dealer_id, date DESC;

-- Performance Issues Summary View
CREATE VIEW performance_issues_summary AS
SELECT 
    dealer_id,
    tenant_id,
    severity,
    COUNT(*) as issue_count,
    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
    MAX(detected_at) as latest_issue
FROM performance_issues
GROUP BY dealer_id, tenant_id, severity
ORDER BY dealer_id, severity;

-- Row Level Security (RLS) Policies
ALTER TABLE dtri_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_metrics_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE elasticity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_queue_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY dtri_tenant_isolation ON dtri_analysis_results
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY trust_tenant_isolation ON trust_metrics_results
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY elasticity_tenant_isolation ON elasticity_results
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY performance_tenant_isolation ON performance_issues
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY enhancement_tenant_isolation ON enhancement_recommendations
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY job_queue_tenant_isolation ON job_queue_status
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Functions for automated cleanup
CREATE OR REPLACE FUNCTION cleanup_old_dtri_results()
RETURNS void AS $$
BEGIN
    -- Delete DTRI analysis results older than 90 days
    DELETE FROM dtri_analysis_results 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete old job queue status records
    DELETE FROM job_queue_status 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND status IN ('completed', 'failed');
    
    -- Log cleanup activity
    INSERT INTO audit_logs (action, table_name, details)
    VALUES ('cleanup', 'dtri_analysis_results', 'Cleaned up old DTRI results and job status records');
END;
$$ LANGUAGE plpgsql;

-- Scheduled cleanup job (runs weekly)
SELECT cron.schedule('dtri-cleanup', '0 1 * * 0', 'SELECT cleanup_old_dtri_results();');

-- Insert sample data for testing
INSERT INTO dtri_analysis_results (dealer_id, tenant_id, analysis_type, results, confidence_score, processing_time_ms)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'comprehensive', 
     '{"dtri_metrics": {"trust_score": 85.5, "revenue_elasticity": 0.65, "performance_index": 78.2, "enhancement_potential": 15.8}}', 
     0.92, 1250),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'trust', 
     '{"trust_metrics": {"overall_trust_score": 78.3, "trust_components": {"reputation": 82, "reviews": 75, "transparency": 80}}}', 
     0.88, 890);

INSERT INTO trust_metrics_results (dealer_id, tenant_id, time_range, trust_metrics, overall_trust_score, trust_trend, trust_change)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '30d', 
     '{"overall_trust": {"mean": 85.5, "std": 3.2}, "distribution": {"excellent": 5, "good": 8, "fair": 2, "poor": 0}}', 
     85.5, 'up', 2.3),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '30d', 
     '{"overall_trust": {"mean": 78.3, "std": 4.1}, "distribution": {"excellent": 2, "good": 6, "fair": 5, "poor": 2}}', 
     78.3, 'stable', 0.1);

INSERT INTO elasticity_results (dealer_id, tenant_id, time_period, elasticity_analysis, elasticity_coefficient, r_squared, confidence_level)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'monthly', 
     '{"elasticity_coefficient": 0.65, "r_squared": 0.78, "confidence_interval": {"lower": 0.58, "upper": 0.72}}', 
     0.65, 0.78, 'high'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'monthly', 
     '{"elasticity_coefficient": 0.42, "r_squared": 0.65, "confidence_interval": {"lower": 0.35, "upper": 0.49}}', 
     0.42, 0.65, 'medium');

-- Performance monitoring queries
CREATE OR REPLACE FUNCTION get_dtri_performance_stats()
RETURNS TABLE (
    total_analyses BIGINT,
    avg_processing_time_ms NUMERIC,
    avg_confidence_score NUMERIC,
    high_confidence_count BIGINT,
    recent_analyses_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_analyses,
        AVG(processing_time_ms) as avg_processing_time_ms,
        AVG(confidence_score) as avg_confidence_score,
        COUNT(CASE WHEN confidence_score > 0.8 THEN 1 END) as high_confidence_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_analyses_count
    FROM dtri_analysis_results;
END;
$$ LANGUAGE plpgsql;
