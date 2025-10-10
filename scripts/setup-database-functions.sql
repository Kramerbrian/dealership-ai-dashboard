-- DealershipAI Visibility Engine Database Functions
-- This script sets up all required database functions for the closed-loop AIV system
-- Run this after the main migration to ensure all functions are properly configured

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Function to compute AOER summary
CREATE OR REPLACE FUNCTION compute_aoer_summary()
RETURNS TABLE(
    tenant_id UUID,
    aoer_score NUMERIC,
    visibility_risk NUMERIC,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    -- Compute AOER (Answer Engine Optimization Rating) for each tenant
    RETURN QUERY
    WITH tenant_metrics AS (
        SELECT 
            dealer_id as tenant_id,
            AVG(aeo) as avg_aeo,
            AVG(geo) as avg_geo,
            AVG(ugc) as avg_ugc,
            STDDEV(aeo) as aeo_volatility,
            COUNT(*) as data_points,
            MAX(date) as last_date
        FROM aiv_raw_signals 
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY dealer_id
    ),
    aoer_calculations AS (
        SELECT 
            tenant_id,
            -- AOER = weighted average of AEO, GEO, UGC with volatility penalty
            (avg_aeo * 0.4 + avg_geo * 0.35 + avg_ugc * 0.25) * 
            (1 - LEAST(aeo_volatility / 20, 0.3)) as aoer_score,
            -- Visibility risk = inverse of data quality and recency
            CASE 
                WHEN data_points < 5 THEN 0.8
                WHEN last_date < CURRENT_DATE - INTERVAL '7 days' THEN 0.6
                WHEN aeo_volatility > 15 THEN 0.4
                ELSE 0.2
            END as visibility_risk,
            last_date
        FROM tenant_metrics
    )
    SELECT 
        tenant_id,
        ROUND(aoer_score::NUMERIC, 2) as aoer_score,
        ROUND(visibility_risk::NUMERIC, 2) as visibility_risk,
        last_date as last_updated
    FROM aoer_calculations;
END;
$$ LANGUAGE plpgsql;

-- Function to compute elasticity metrics
CREATE OR REPLACE FUNCTION compute_elasticity(tenant_uuid UUID DEFAULT NULL)
RETURNS TABLE(
    tenant_id UUID,
    elasticity_usd_per_pt NUMERIC,
    r2_coefficient NUMERIC,
    confidence_interval_lower NUMERIC,
    confidence_interval_upper NUMERIC,
    sample_size INTEGER,
    last_computed TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH tenant_data AS (
        SELECT 
            dealer_id,
            observed_aiv,
            observed_rar,
            date
        FROM aiv_raw_signals 
        WHERE (tenant_uuid IS NULL OR dealer_id = tenant_uuid)
        AND date >= CURRENT_DATE - INTERVAL '8 weeks'
        AND observed_aiv IS NOT NULL 
        AND observed_rar IS NOT NULL
        ORDER BY date
    ),
    regression_stats AS (
        SELECT 
            dealer_id,
            COUNT(*) as n,
            AVG(observed_aiv) as avg_aiv,
            AVG(observed_rar) as avg_rar,
            SUM((observed_aiv - AVG(observed_aiv)) * (observed_rar - AVG(observed_rar))) as sum_xy,
            SUM(POWER(observed_aiv - AVG(observed_aiv), 2)) as sum_x2,
            SUM(POWER(observed_rar - AVG(observed_rar), 2)) as sum_y2
        FROM tenant_data
        GROUP BY dealer_id
        HAVING COUNT(*) >= 4
    ),
    elasticity_calc AS (
        SELECT 
            dealer_id,
            n,
            -- Elasticity = slope of regression line (dollars per AIV point)
            CASE 
                WHEN sum_x2 > 0 THEN sum_xy / sum_x2
                ELSE 0
            END as elasticity,
            -- R² coefficient
            CASE 
                WHEN sum_x2 > 0 AND sum_y2 > 0 THEN 
                    POWER(sum_xy, 2) / (sum_x2 * sum_y2)
                ELSE 0
            END as r2,
            -- Standard error for confidence interval
            CASE 
                WHEN n > 2 AND sum_x2 > 0 THEN 
                    SQRT((sum_y2 - POWER(sum_xy, 2) / sum_x2) / (n - 2)) / SQRT(sum_x2)
                ELSE 0
            END as std_error
        FROM regression_stats
    )
    SELECT 
        dealer_id as tenant_id,
        ROUND(elasticity::NUMERIC, 2) as elasticity_usd_per_pt,
        ROUND(r2::NUMERIC, 3) as r2_coefficient,
        ROUND((elasticity - 1.96 * std_error)::NUMERIC, 2) as confidence_interval_lower,
        ROUND((elasticity + 1.96 * std_error)::NUMERIC, 2) as confidence_interval_upper,
        n::INTEGER as sample_size,
        CURRENT_TIMESTAMPTZ as last_computed
    FROM elasticity_calc
    WHERE elasticity > 0 AND r2 > 0.1;
END;
$$ LANGUAGE plpgsql;

-- Function to ingest AOER batch data
CREATE OR REPLACE FUNCTION ingest_aoer_batch(data_json JSONB)
RETURNS TABLE(
    inserted_count INTEGER,
    updated_count INTEGER,
    error_count INTEGER
) AS $$
DECLARE
    data_item JSONB;
    insert_count INTEGER := 0;
    update_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Process each item in the JSON array
    FOR data_item IN SELECT * FROM jsonb_array_elements(data_json)
    LOOP
        BEGIN
            -- Insert or update AOER query data
            INSERT INTO aoer_queries (
                tenant_id,
                query_text,
                engine_type,
                visibility_score,
                position,
                date_observed,
                metadata
            ) VALUES (
                (data_item->>'tenant_id')::UUID,
                data_item->>'query_text',
                data_item->>'engine_type',
                (data_item->>'visibility_score')::NUMERIC,
                (data_item->>'position')::INTEGER,
                (data_item->>'date_observed')::TIMESTAMPTZ,
                data_item->'metadata'
            )
            ON CONFLICT (tenant_id, query_text, engine_type, date_observed)
            DO UPDATE SET
                visibility_score = EXCLUDED.visibility_score,
                position = EXCLUDED.position,
                metadata = EXCLUDED.metadata,
                updated_at = CURRENT_TIMESTAMPTZ;
            
            IF FOUND THEN
                insert_count := insert_count + 1;
            ELSE
                update_count := update_count + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            -- Log error to aoer_failures table
            INSERT INTO aoer_failures (
                tenant_id,
                error_message,
                failed_data,
                created_at
            ) VALUES (
                (data_item->>'tenant_id')::UUID,
                SQLERRM,
                data_item,
                CURRENT_TIMESTAMPTZ
            );
        END;
    END LOOP;
    
    RETURN QUERY SELECT insert_count, update_count, error_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get health status
CREATE OR REPLACE FUNCTION health_ping()
RETURNS TABLE(
    status TEXT,
    timestamp TIMESTAMPTZ,
    database_version TEXT,
    active_connections INTEGER,
    uptime INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'healthy'::TEXT as status,
        CURRENT_TIMESTAMPTZ as timestamp,
        version()::TEXT as database_version,
        (SELECT count(*) FROM pg_stat_activity)::INTEGER as active_connections,
        (SELECT CURRENT_TIMESTAMP - pg_postmaster_start_time())::INTERVAL as uptime;
END;
$$ LANGUAGE plpgsql;

-- Function to get system metrics
CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS TABLE(
    metric_name TEXT,
    metric_value NUMERIC,
    metric_unit TEXT,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH system_stats AS (
        SELECT 
            'total_tenants'::TEXT as name,
            COUNT(DISTINCT dealer_id)::NUMERIC as value,
            'count'::TEXT as unit,
            MAX(updated_at) as updated
        FROM aiv_raw_signals
        
        UNION ALL
        
        SELECT 
            'avg_aiv_score'::TEXT as name,
            AVG(
                (seo * 0.25 + aeo * 0.30 + geo * 0.20 + ugc * 0.15 + geolocal * 0.10)
            )::NUMERIC as value,
            'points'::TEXT as unit,
            MAX(updated_at) as updated
        FROM aiv_raw_signals
        WHERE date >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
            'total_evaluations'::TEXT as name,
            COUNT(*)::NUMERIC as value,
            'count'::TEXT as unit,
            MAX(run_date) as updated
        FROM model_audit
        WHERE run_type = 'evaluate'
        
        UNION ALL
        
        SELECT 
            'avg_model_accuracy'::TEXT as name,
            AVG(r2)::NUMERIC as value,
            'r2_score'::TEXT as unit,
            MAX(run_date) as updated
        FROM model_audit
        WHERE run_type = 'evaluate'
        AND run_date >= CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
        name as metric_name,
        value as metric_value,
        unit as metric_unit,
        updated as last_updated
    FROM system_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE(
    table_name TEXT,
    deleted_count INTEGER,
    cleanup_date TIMESTAMPTZ
) AS $$
DECLARE
    cleanup_date TIMESTAMPTZ := CURRENT_TIMESTAMPTZ;
    aiv_deleted INTEGER;
    audit_deleted INTEGER;
    failures_deleted INTEGER;
BEGIN
    -- Clean up old AIV raw signals (keep 1 year)
    DELETE FROM aiv_raw_signals 
    WHERE date < CURRENT_DATE - INTERVAL '1 year';
    GET DIAGNOSTICS aiv_deleted = ROW_COUNT;
    
    -- Clean up old model audit entries (keep 6 months)
    DELETE FROM model_audit 
    WHERE run_date < CURRENT_DATE - INTERVAL '6 months';
    GET DIAGNOSTICS audit_deleted = ROW_COUNT;
    
    -- Clean up old failure logs (keep 3 months)
    DELETE FROM aoer_failures 
    WHERE created_at < CURRENT_DATE - INTERVAL '3 months';
    GET DIAGNOSTICS failures_deleted = ROW_COUNT;
    
    RETURN QUERY
    SELECT 'aiv_raw_signals'::TEXT, aiv_deleted, cleanup_date
    UNION ALL
    SELECT 'model_audit'::TEXT, audit_deleted, cleanup_date
    UNION ALL
    SELECT 'aoer_failures'::TEXT, failures_deleted, cleanup_date;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aiv_raw_signals_dealer_date 
ON aiv_raw_signals(dealer_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_aiv_raw_signals_date 
ON aiv_raw_signals(date DESC);

CREATE INDEX IF NOT EXISTS idx_model_audit_run_date 
ON model_audit(run_date DESC);

CREATE INDEX IF NOT EXISTS idx_model_audit_dealer_type 
ON model_audit(dealer_id, run_type);

CREATE INDEX IF NOT EXISTS idx_aoer_queries_tenant_date 
ON aoer_queries(tenant_id, date_observed DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_events_tenant_date 
ON metrics_events(tenant_id, created_at DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW v_latest_aiv_metrics AS
SELECT 
    dealer_id,
    date,
    (seo * 0.25 + aeo * 0.30 + geo * 0.20 + ugc * 0.15 + geolocal * 0.10) as aiv_score,
    aeo as ati_score,
    ((seo * 0.25 + aeo * 0.30 + geo * 0.20 + ugc * 0.15 + geolocal * 0.10) + aeo) / 2 as crs_score,
    observed_rar,
    elasticity_usd_per_pt,
    updated_at
FROM aiv_raw_signals
WHERE date >= CURRENT_DATE - INTERVAL '30 days';

CREATE OR REPLACE VIEW v_model_performance AS
SELECT 
    dealer_id,
    run_type,
    AVG(r2) as avg_r2,
    AVG(rmse) as avg_rmse,
    AVG(mape) as avg_mape,
    COUNT(*) as evaluation_count,
    MAX(run_date) as last_evaluation
FROM model_audit
WHERE run_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY dealer_id, run_type;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION compute_aoer_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION compute_elasticity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ingest_aoer_batch(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION health_ping() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data() TO authenticated;

GRANT SELECT ON v_latest_aiv_metrics TO authenticated;
GRANT SELECT ON v_model_performance TO authenticated;

-- Create a function to set up cron jobs (requires superuser privileges)
CREATE OR REPLACE FUNCTION setup_cron_jobs()
RETURNS TEXT AS $$
BEGIN
    -- Schedule nightly AOER computation
    PERFORM cron.schedule(
        'nightly-compute-aoer',
        '0 4 * * *',
        'SELECT compute_aoer_summary();'
    );
    
    -- Schedule nightly elasticity recomputation
    PERFORM cron.schedule(
        'nightly-compute-elasticity',
        '15 4 * * *',
        'SELECT compute_elasticity();'
    );
    
    -- Schedule weekly cleanup
    PERFORM cron.schedule(
        'weekly-cleanup',
        '0 2 * * 0',
        'SELECT cleanup_old_data();'
    );
    
    RETURN 'Cron jobs scheduled successfully';
EXCEPTION WHEN OTHERS THEN
    RETURN 'Failed to schedule cron jobs: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'DealershipAI Visibility Engine database functions setup completed successfully!';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - compute_aoer_summary()';
    RAISE NOTICE '  - compute_elasticity(tenant_uuid)';
    RAISE NOTICE '  - ingest_aoer_batch(data_json)';
    RAISE NOTICE '  - health_ping()';
    RAISE NOTICE '  - get_system_metrics()';
    RAISE NOTICE '  - cleanup_old_data()';
    RAISE NOTICE '  - setup_cron_jobs()';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - v_latest_aiv_metrics';
    RAISE NOTICE '  - v_model_performance';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Permissions granted to authenticated users';
END $$;
