-- Document Uploads Migration
-- This migration creates tables for storing document uploads and AI analysis results

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create document uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    file_id VARCHAR(255) NOT NULL, -- Anthropic file ID
    file_name VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    upload_status VARCHAR(50) DEFAULT 'uploading', -- uploading, processing, completed, error
    analysis_data JSONB, -- AI analysis results
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ
);

-- Create document analysis cache table
CREATE TABLE IF NOT EXISTS document_analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id VARCHAR(255) NOT NULL,
    analysis_type VARCHAR(100) NOT NULL, -- summary, insights, recommendations, sentiment
    analysis_result JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMPTZ + INTERVAL '30 days')
);

-- Create document insights table (for storing insights generated from documents)
CREATE TABLE IF NOT EXISTS document_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    document_upload_id UUID NOT NULL,
    insight_type VARCHAR(50) NOT NULL, -- opportunity, threat, trend, recommendation
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    impact DECIMAL(5,2) NOT NULL, -- 1-100
    confidence DECIMAL(5,2) NOT NULL, -- 1-100
    source_section VARCHAR(255), -- which part of the document this came from
    page_number INTEGER,
    ai_generated BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    action_required BOOLEAN DEFAULT false,
    action_text TEXT,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ,
    FOREIGN KEY (document_upload_id) REFERENCES document_uploads(id) ON DELETE CASCADE
);

-- Create document categories table
CREATE TABLE IF NOT EXISTS document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- hex color code
    icon VARCHAR(50), -- icon name
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ
);

-- Insert default document categories
INSERT INTO document_categories (name, description, color, icon) VALUES
('Financial Reports', 'Financial statements, budgets, and financial analysis documents', '#10B981', 'dollar-sign'),
('Marketing Materials', 'Marketing plans, campaigns, and promotional materials', '#3B82F6', 'megaphone'),
('Customer Feedback', 'Customer reviews, surveys, and feedback documents', '#8B5CF6', 'message-circle'),
('Operations Manual', 'Standard operating procedures and operational guidelines', '#F59E0B', 'settings'),
('Legal Documents', 'Contracts, agreements, and legal compliance documents', '#EF4444', 'file-text'),
('Training Materials', 'Employee training guides and educational content', '#06B6D4', 'book-open'),
('Research Reports', 'Market research, analysis, and industry reports', '#84CC16', 'search'),
('Technical Documentation', 'Technical specifications and system documentation', '#6366F1', 'code'),
('Sales Materials', 'Sales presentations, proposals, and sales guides', '#EC4899', 'trending-up'),
('HR Documents', 'Human resources policies, procedures, and employee documents', '#F97316', 'users')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_tenant_id ON document_uploads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_file_id ON document_uploads(file_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_document_uploads_created_at ON document_uploads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_analysis_cache_file_id ON document_analysis_cache(file_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_cache_type ON document_analysis_cache(analysis_type);
CREATE INDEX IF NOT EXISTS idx_document_analysis_cache_expires_at ON document_analysis_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_document_insights_tenant_id ON document_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_insights_document_upload_id ON document_insights(document_upload_id);
CREATE INDEX IF NOT EXISTS idx_document_insights_type ON document_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_document_insights_priority ON document_insights(priority);
CREATE INDEX IF NOT EXISTS idx_document_insights_ai_generated ON document_insights(ai_generated);
CREATE INDEX IF NOT EXISTS idx_document_insights_created_at ON document_insights(created_at DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW v_document_uploads_summary AS
SELECT 
    tenant_id,
    COUNT(*) as total_uploads,
    COUNT(*) FILTER (WHERE upload_status = 'completed') as completed_uploads,
    COUNT(*) FILTER (WHERE upload_status = 'error') as failed_uploads,
    COUNT(*) FILTER (WHERE analysis_data IS NOT NULL) as analyzed_uploads,
    AVG(file_size) as average_file_size,
    MAX(created_at) as last_upload_date
FROM document_uploads
GROUP BY tenant_id;

CREATE OR REPLACE VIEW v_document_insights_summary AS
SELECT 
    tenant_id,
    COUNT(*) as total_insights,
    COUNT(*) FILTER (WHERE priority = 'high' OR priority = 'critical') as high_priority_insights,
    COUNT(*) FILTER (WHERE action_required = true) as actionable_insights,
    COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated_insights,
    COUNT(*) FILTER (WHERE verified = true) as verified_insights,
    AVG(impact) as average_impact,
    AVG(confidence) as average_confidence,
    MAX(created_at) as last_insight_date
FROM document_insights
GROUP BY tenant_id;

-- Create functions for document analysis
CREATE OR REPLACE FUNCTION analyze_document_content(file_id_param VARCHAR(255))
RETURNS TABLE(
    summary TEXT,
    key_insights TEXT[],
    recommendations TEXT[],
    categories TEXT[],
    sentiment VARCHAR(20),
    confidence DECIMAL(5,2),
    word_count INTEGER,
    topics TEXT[]
) AS $$
BEGIN
    -- This is a placeholder function - in production, this would call AI services
    -- to analyze the document content
    RETURN QUERY
    SELECT 
        'This is a sample document analysis'::TEXT as summary,
        ARRAY['Sample insight 1', 'Sample insight 2']::TEXT[] as key_insights,
        ARRAY['Sample recommendation 1', 'Sample recommendation 2']::TEXT[] as recommendations,
        ARRAY['General', 'Business']::TEXT[] as categories,
        'neutral'::VARCHAR(20) as sentiment,
        0.85::DECIMAL(5,2) as confidence,
        1000::INTEGER as word_count,
        ARRAY['business', 'strategy', 'analysis']::TEXT[] as topics;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_document_insights(
    tenant_uuid UUID,
    document_upload_uuid UUID,
    analysis_data JSONB
)
RETURNS VOID AS $$
DECLARE
    insight_record RECORD;
    key_insights JSONB;
    recommendations JSONB;
    categories JSONB;
    sentiment VARCHAR(20);
    confidence DECIMAL(5,2);
BEGIN
    -- Extract data from analysis_data JSONB
    key_insights := analysis_data->'keyInsights';
    recommendations := analysis_data->'recommendations';
    categories := analysis_data->'categories';
    sentiment := analysis_data->>'sentiment';
    confidence := (analysis_data->>'confidence')::DECIMAL(5,2);

    -- Generate insights from key insights
    IF key_insights IS NOT NULL AND jsonb_array_length(key_insights) > 0 THEN
        FOR insight_record IN 
            SELECT value as insight_text
            FROM jsonb_array_elements(key_insights)
        LOOP
            INSERT INTO document_insights (
                tenant_id,
                document_upload_id,
                insight_type,
                priority,
                title,
                description,
                impact,
                confidence,
                ai_generated,
                verified,
                action_required,
                action_text,
                tags
            ) VALUES (
                tenant_uuid,
                document_upload_uuid,
                'opportunity',
                'medium',
                'Document Insight: ' || LEFT(insight_record.insight_text, 100),
                insight_record.insight_text,
                LEAST(90, GREATEST(60, ROUND(RANDOM() * 30 + 60))),
                COALESCE(confidence * 100, 80),
                true,
                false,
                true,
                'Review and implement document insights',
                ARRAY(SELECT jsonb_array_elements_text(categories))
            );
        END LOOP;
    END IF;

    -- Generate recommendations
    IF recommendations IS NOT NULL AND jsonb_array_length(recommendations) > 0 THEN
        FOR insight_record IN 
            SELECT value as rec_text
            FROM jsonb_array_elements(recommendations)
        LOOP
            INSERT INTO document_insights (
                tenant_id,
                document_upload_id,
                insight_type,
                priority,
                title,
                description,
                impact,
                confidence,
                ai_generated,
                verified,
                action_required,
                action_text,
                tags
            ) VALUES (
                tenant_uuid,
                document_upload_uuid,
                'recommendation',
                'high',
                'Document Recommendation: ' || LEFT(insight_record.rec_text, 100),
                insight_record.rec_text,
                LEAST(100, GREATEST(70, ROUND(RANDOM() * 30 + 70))),
                COALESCE(confidence * 100, 85),
                true,
                false,
                true,
                'Implement document recommendation',
                ARRAY(SELECT jsonb_array_elements_text(categories))
            );
        END LOOP;
    END IF;

    -- Generate sentiment-based insight
    IF sentiment IS NOT NULL AND sentiment != 'neutral' THEN
        INSERT INTO document_insights (
            tenant_id,
            document_upload_id,
            insight_type,
            priority,
            title,
            description,
            impact,
            confidence,
            ai_generated,
            verified,
            action_required,
            action_text,
            tags
        ) VALUES (
            tenant_uuid,
            document_upload_uuid,
            CASE 
                WHEN sentiment = 'positive' THEN 'achievement'
                WHEN sentiment = 'negative' THEN 'alert'
                ELSE 'trend'
            END,
            CASE 
                WHEN sentiment = 'positive' THEN 'low'
                WHEN sentiment = 'negative' THEN 'medium'
                ELSE 'low'
            END,
            'Document Sentiment: ' || UPPER(sentiment),
            'The document shows ' || sentiment || ' sentiment with ' || 
            ROUND(COALESCE(confidence * 100, 80)) || '% confidence.',
            CASE 
                WHEN sentiment = 'positive' THEN 60
                WHEN sentiment = 'negative' THEN 75
                ELSE 50
            END,
            COALESCE(confidence * 100, 80),
            true,
            false,
            sentiment = 'negative',
            CASE 
                WHEN sentiment = 'negative' THEN 'Address negative sentiment issues'
                WHEN sentiment = 'positive' THEN 'Leverage positive sentiment'
                ELSE 'Monitor sentiment trends'
            END,
            ARRAY['document', 'sentiment', sentiment]
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_analysis_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM document_analysis_cache 
    WHERE expires_at < CURRENT_TIMESTAMPTZ;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON document_uploads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_analysis_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_insights TO authenticated;
GRANT SELECT ON document_categories TO authenticated;

GRANT SELECT ON v_document_uploads_summary TO authenticated;
GRANT SELECT ON v_document_insights_summary TO authenticated;

GRANT EXECUTE ON FUNCTION analyze_document_content(VARCHAR(255)) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_document_insights(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_analysis_cache() TO authenticated;

-- Create RLS policies
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_uploads
CREATE POLICY "Users can view their own document uploads" ON document_uploads
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own document uploads" ON document_uploads
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own document uploads" ON document_uploads
    FOR UPDATE USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can delete their own document uploads" ON document_uploads
    FOR DELETE USING (tenant_id = auth.uid()::text::uuid);

-- RLS policies for document_analysis_cache
CREATE POLICY "Users can view analysis cache" ON document_analysis_cache
    FOR SELECT USING (true);

CREATE POLICY "Users can insert analysis cache" ON document_analysis_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update analysis cache" ON document_analysis_cache
    FOR UPDATE USING (true);

-- RLS policies for document_insights
CREATE POLICY "Users can view their own document insights" ON document_insights
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own document insights" ON document_insights
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own document insights" ON document_insights
    FOR UPDATE USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can delete their own document insights" ON document_insights
    FOR DELETE USING (tenant_id = auth.uid()::text::uuid);

-- Create a function to automatically generate insights when a document is uploaded
CREATE OR REPLACE FUNCTION trigger_generate_document_insights()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate insights if the upload is completed and has analysis data
    IF NEW.upload_status = 'completed' AND NEW.analysis_data IS NOT NULL THEN
        PERFORM generate_document_insights(
            NEW.tenant_id,
            NEW.id,
            NEW.analysis_data
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate insights
CREATE TRIGGER trigger_document_insights_generation
    AFTER UPDATE ON document_uploads
    FOR EACH ROW
    WHEN (NEW.upload_status = 'completed' AND NEW.analysis_data IS NOT NULL)
    EXECUTE FUNCTION trigger_generate_document_insights();

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Document Uploads migration completed successfully!';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - document_uploads';
    RAISE NOTICE '  - document_analysis_cache';
    RAISE NOTICE '  - document_insights';
    RAISE NOTICE '  - document_categories';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - v_document_uploads_summary';
    RAISE NOTICE '  - v_document_insights_summary';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - analyze_document_content()';
    RAISE NOTICE '  - generate_document_insights()';
    RAISE NOTICE '  - cleanup_expired_analysis_cache()';
    RAISE NOTICE 'Triggers created:';
    RAISE NOTICE '  - trigger_document_insights_generation';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'RLS policies enabled for security';
    RAISE NOTICE 'Default document categories inserted';
END $$;
