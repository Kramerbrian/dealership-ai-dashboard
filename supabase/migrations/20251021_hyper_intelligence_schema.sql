-- DealershipAI Hyper-Intelligence Schema
-- Comprehensive intelligence platform for automotive data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Core Intelligence Tables

-- Inventory Items with Freshness Scoring
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    dealer_id UUID NOT NULL,
    freshness_score DECIMAL(5,2) DEFAULT 0,
    last_price_change TIMESTAMP DEFAULT NOW(),
    last_photo_refresh TIMESTAMP DEFAULT NOW(),
    last_mileage_update TIMESTAMP DEFAULT NOW(),
    retail_ready_score DECIMAL(5,2) DEFAULT 0,
    parity_match_rate DECIMAL(5,2) DEFAULT 0,
    sticker_parity_score DECIMAL(5,2) DEFAULT 0,
    policy_compliance_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Offer Management
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    dealer_id UUID NOT NULL,
    offer_amount DECIMAL(10,2) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_offer_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES offers(id),
    customer_id UUID,
    reserved_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);

-- Parity and Compliance Tracking
CREATE TABLE IF NOT EXISTS parity_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    source_of_truth VARCHAR(50) NOT NULL,
    price DECIMAL(10,2),
    availability BOOLEAN DEFAULT true,
    captured_at TIMESTAMP DEFAULT NOW(),
    dealer_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS aiv_probes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    probe_type VARCHAR(50) NOT NULL,
    result JSONB,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS score_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    score_type VARCHAR(50) NOT NULL,
    score_value DECIMAL(5,2) NOT NULL,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Intelligence Task Management
CREATE TABLE IF NOT EXISTS intel_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    expected_value_usd DECIMAL(10,2) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    urgency INTEGER DEFAULT 1,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    dealer_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intel_task_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES intel_tasks(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SHAP Attribution for Explainability
CREATE TABLE IF NOT EXISTS shap_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    attribution_value DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Canary VINs for Monitoring
CREATE TABLE IF NOT EXISTS canary_vins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    dealer_id UUID NOT NULL,
    last_crawled TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Publish Contract Logs
CREATE TABLE IF NOT EXISTS publish_contract_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    validation_result JSONB,
    passed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Model Management
CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    performance_metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_calibration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id UUID REFERENCES model_versions(id),
    tenant_id UUID NOT NULL,
    calibration_params JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drift_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id UUID REFERENCES model_versions(id),
    drift_type VARCHAR(50) NOT NULL,
    drift_score DECIMAL(5,4) NOT NULL,
    threshold_exceeded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_vin ON inventory_items(vin);
CREATE INDEX IF NOT EXISTS idx_inventory_items_dealer ON inventory_items(dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_freshness ON inventory_items(freshness_score);
CREATE INDEX IF NOT EXISTS idx_inventory_items_retail_ready ON inventory_items(retail_ready_score);

CREATE INDEX IF NOT EXISTS idx_offers_vin ON offers(vin);
CREATE INDEX IF NOT EXISTS idx_offers_dealer ON offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_offers_confidence ON offers(confidence_score);

CREATE INDEX IF NOT EXISTS idx_parity_snapshots_vin ON parity_snapshots(vin);
CREATE INDEX IF NOT EXISTS idx_parity_snapshots_captured ON parity_snapshots(captured_at);

CREATE INDEX IF NOT EXISTS idx_intel_tasks_status ON intel_tasks(status);
CREATE INDEX IF NOT EXISTS idx_intel_tasks_dealer ON intel_tasks(dealer_id);
CREATE INDEX IF NOT EXISTS idx_intel_tasks_urgency ON intel_tasks(urgency);

CREATE INDEX IF NOT EXISTS idx_shap_attributions_vin ON shap_attributions(vin);
CREATE INDEX IF NOT EXISTS idx_shap_attributions_model ON shap_attributions(model_version);

-- Row Level Security Policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_offer_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parity_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE aiv_probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shap_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canary_vins ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_contract_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE drift_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Multi-tenant Isolation
CREATE POLICY inventory_items_tenant_isolation ON inventory_items
    FOR ALL USING (dealer_id::text = auth.uid()::text);

CREATE POLICY offers_tenant_isolation ON offers
    FOR ALL USING (dealer_id::text = auth.uid()::text);

CREATE POLICY ai_offer_reservations_tenant_isolation ON ai_offer_reservations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM offers o WHERE o.id = ai_offer_reservations.offer_id 
        AND o.dealer_id::text = auth.uid()::text
    ));

CREATE POLICY parity_snapshots_tenant_isolation ON parity_snapshots
    FOR ALL USING (dealer_id::text = auth.uid()::text);

CREATE POLICY aiv_probes_tenant_isolation ON aiv_probes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM inventory_items i WHERE i.vin = aiv_probes.vin 
        AND i.dealer_id::text = auth.uid()::text
    ));

CREATE POLICY score_snapshots_tenant_isolation ON score_snapshots
    FOR ALL USING (EXISTS (
        SELECT 1 FROM inventory_items i WHERE i.vin = score_snapshots.vin 
        AND i.dealer_id::text = auth.uid()::text
    ));

CREATE POLICY intel_tasks_tenant_isolation ON intel_tasks
    FOR ALL USING (dealer_id::text = auth.uid()::text);

CREATE POLICY intel_task_events_tenant_isolation ON intel_task_events
    FOR ALL USING (EXISTS (
        SELECT 1 FROM intel_tasks t WHERE t.id = intel_task_events.task_id 
        AND t.dealer_id::text = auth.uid()::text
    ));

CREATE POLICY shap_attributions_tenant_isolation ON shap_attributions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM inventory_items i WHERE i.vin = shap_attributions.vin 
        AND i.dealer_id::text = auth.uid()::text
    ));

CREATE POLICY canary_vins_tenant_isolation ON canary_vins
    FOR ALL USING (dealer_id::text = auth.uid()::text);

CREATE POLICY publish_contract_logs_tenant_isolation ON publish_contract_logs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM inventory_items i WHERE i.vin = publish_contract_logs.vin 
        AND i.dealer_id::text = auth.uid()::text
    ));

-- Global policies for model management (admin access)
CREATE POLICY model_versions_global_access ON model_versions
    FOR ALL USING (true);

CREATE POLICY model_calibration_tenant_isolation ON model_calibration
    FOR ALL USING (tenant_id::text = auth.uid()::text);

CREATE POLICY drift_events_global_access ON drift_events
    FOR ALL USING (true);

-- Functions for Freshness Scoring
CREATE OR REPLACE FUNCTION calculate_freshness_score(
    price_hours INTEGER,
    photo_hours INTEGER,
    mileage_hours INTEGER
) RETURNS DECIMAL(5,2) AS $$
BEGIN
    RETURN GREATEST(0, 100 - 
        (0.5 * (price_hours::DECIMAL / 168)) - 
        (0.3 * (photo_hours::DECIMAL / 720)) - 
        (0.2 * (mileage_hours::DECIMAL / 168))
    );
END;
$$ LANGUAGE plpgsql;

-- Function for Retail Readiness Calculation
CREATE OR REPLACE FUNCTION calculate_retail_readiness(
    freshness DECIMAL(5,2),
    match_rate DECIMAL(5,2),
    sticker_score DECIMAL(5,2),
    policy_score DECIMAL(5,2)
) RETURNS DECIMAL(5,2) AS $$
BEGIN
    RETURN (0.3 * freshness) + 
           (0.35 * match_rate) + 
           (0.2 * sticker_score) + 
           (0.15 * policy_score);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update freshness score
CREATE OR REPLACE FUNCTION update_freshness_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.freshness_score := calculate_freshness_score(
        EXTRACT(EPOCH FROM (NOW() - NEW.last_price_change)) / 3600,
        EXTRACT(EPOCH FROM (NOW() - NEW.last_photo_refresh)) / 3600,
        EXTRACT(EPOCH FROM (NOW() - NEW.last_mileage_update)) / 3600
    );
    
    NEW.retail_ready_score := calculate_retail_readiness(
        NEW.freshness_score,
        NEW.parity_match_rate,
        NEW.sticker_parity_score,
        NEW.policy_compliance_score
    );
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_freshness_score
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_freshness_score();

-- Cron Jobs for Automation
SELECT cron.schedule('freshness-recompute', '0 * * * *', 'SELECT refresh_freshness_scores();');
SELECT cron.schedule('canary-crawl', '*/15 * * * *', 'SELECT crawl_canary_vins();');
SELECT cron.schedule('model-retrain', '0 3 * * 1', 'SELECT trigger_model_retrain();');

-- Sample Data for Testing
INSERT INTO inventory_items (vin, dealer_id, last_price_change, last_photo_refresh, last_mileage_update)
VALUES 
    ('1HGBH41JXMN109186', gen_random_uuid(), NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
    ('1HGBH41JXMN109187', gen_random_uuid(), NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours'),
    ('1HGBH41JXMN109188', gen_random_uuid(), NOW() - INTERVAL '3 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour');

-- Create materialized view for performance
CREATE MATERIALIZED VIEW IF NOT EXISTS inventory_freshness_summary AS
SELECT 
    dealer_id,
    COUNT(*) as total_items,
    AVG(freshness_score) as avg_freshness,
    AVG(retail_ready_score) as avg_retail_ready,
    COUNT(CASE WHEN retail_ready_score >= 85 THEN 1 END) as retail_ready_count
FROM inventory_items
GROUP BY dealer_id;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_freshness_scores()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW inventory_freshness_summary;
END;
$$ LANGUAGE plpgsql;

-- Canary crawl function
CREATE OR REPLACE FUNCTION crawl_canary_vins()
RETURNS void AS $$
BEGIN
    -- Update canary VINs last_crawled timestamp
    UPDATE canary_vins 
    SET last_crawled = NOW() 
    WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Model retrain trigger function
CREATE OR REPLACE FUNCTION trigger_model_retrain()
RETURNS void AS $$
BEGIN
    -- Insert retrain task
    INSERT INTO intel_tasks (type, expected_value_usd, confidence, urgency, payload)
    VALUES ('model_retrain', 0, 1.0, 1, '{"trigger": "scheduled", "frequency": "weekly"}');
END;
$$ LANGUAGE plpgsql;
