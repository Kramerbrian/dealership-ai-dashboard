-- ============================================
-- Add Appraisal Analysis Table
-- ============================================
-- Run this in Supabase SQL Editor

-- Create appraisal_analysis table
CREATE TABLE IF NOT EXISTS appraisal_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID NOT NULL REFERENCES dealership_data(id) ON DELETE CASCADE,

    -- Scores
    penetration_score INTEGER CHECK (penetration_score >= 0 AND penetration_score <= 100),
    form_quality_score INTEGER CHECK (form_quality_score >= 0 AND form_quality_score <= 100),
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),

    -- Analysis Results (JSON)
    forms_discovered JSONB DEFAULT '[]',
    ai_platform_results JSONB DEFAULT '{}',
    competitive_analysis JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    detailed_analysis JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_appraisal_analysis_tenant_id ON appraisal_analysis(tenant_id);
CREATE INDEX idx_appraisal_analysis_dealership_id ON appraisal_analysis(dealership_id);
CREATE INDEX idx_appraisal_analysis_created_at ON appraisal_analysis(created_at DESC);

-- Enable RLS
ALTER TABLE appraisal_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view appraisal analysis for their tenant" ON appraisal_analysis
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert appraisal analysis for their tenant" ON appraisal_analysis
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update appraisal analysis for their tenant" ON appraisal_analysis
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_appraisal_analysis_updated_at
    BEFORE UPDATE ON appraisal_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON appraisal_analysis TO authenticated;

-- Success message
SELECT 'Appraisal analysis table created successfully!' as message;
