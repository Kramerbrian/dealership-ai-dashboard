-- =====================================================
-- LEADS & EMAIL AUTOMATION SCHEMA
-- Migration: 20250101000002_leads_and_email.sql
-- Purpose: Lead capture, email automation, and conversion tracking
-- =====================================================

-- =====================================================
-- 1. LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Lead Information
    dealer TEXT NOT NULL,
    email TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT false,

    -- Source Tracking
    source TEXT DEFAULT 'instant_analyzer' CHECK (
        source IN ('instant_analyzer', 'fleet_signup', 'referral', 'direct', 'organic', 'paid')
    ),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,

    -- Lead Qualification
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    status TEXT DEFAULT 'new' CHECK (
        status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')
    ),

    -- Enrichment Data
    company_name TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,

    -- Engagement Tracking
    scans_completed INTEGER DEFAULT 1,
    report_unlocked BOOLEAN DEFAULT false,
    report_unlocked_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Conversion Tracking
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Email Automation
    welcome_email_sent BOOLEAN DEFAULT false,
    welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
    nurture_sequence_stage INTEGER DEFAULT 0,
    nurture_opt_out BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(email, dealer)
);

-- Indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status) WHERE status IN ('new', 'contacted', 'qualified');
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_converted ON leads(converted, converted_at) WHERE converted = true;
CREATE INDEX idx_leads_nurture ON leads(nurture_sequence_stage, nurture_opt_out) WHERE nurture_opt_out = false;

-- =====================================================
-- 2. EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template Identity
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,

    -- Template Type
    template_type TEXT CHECK (
        template_type IN ('welcome', 'nurture_day1', 'nurture_day3', 'nurture_day7', 'report', 'conversion', 'reengagement')
    ),

    -- Content
    html_body TEXT NOT NULL,
    text_body TEXT NOT NULL,

    -- Variables available in template
    variables JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,

    -- A/B Testing
    variant TEXT DEFAULT 'control',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. EMAIL SENDS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Email Details
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

    -- Send Details
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam')
    ),

    -- Provider Details (Resend, SendGrid, etc.)
    provider TEXT DEFAULT 'resend',
    provider_message_id TEXT,

    -- Engagement Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,

    -- Error Tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_sends_lead ON email_sends(lead_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_email_sends_sent ON email_sends(sent_at DESC);

-- =====================================================
-- 4. SCAN HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Scan Details
    dealer TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

    -- Results
    zero_click_score NUMERIC(5,2),
    ai_visibility_score NUMERIC(5,2),
    schema_coverage_score NUMERIC(5,2),
    ugc_score NUMERIC(5,2),
    revenue_at_risk_usd NUMERIC(12,2),

    -- AI Platform Scores
    chatgpt_score NUMERIC(5,2),
    claude_score NUMERIC(5,2),
    perplexity_score NUMERIC(5,2),
    gemini_score NUMERIC(5,2),

    -- Full Results
    full_results JSONB,

    -- Session Info
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scan_history_dealer ON scan_history(dealer);
CREATE INDEX idx_scan_history_lead ON scan_history(lead_id);
CREATE INDEX idx_scan_history_created ON scan_history(created_at DESC);

-- =====================================================
-- 5. ROW-LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Leads policies (admins can see all, users can see their own)
CREATE POLICY "Admins can view all leads"
    ON leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.clerk_id = auth.jwt() ->> 'sub'
            AND users.role IN ('super_admin', 'enterprise_admin')
        )
    );

CREATE POLICY "Users can view their converted lead"
    ON leads FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
    );

CREATE POLICY "System can insert leads"
    ON leads FOR INSERT
    WITH CHECK (true); -- Public endpoint

CREATE POLICY "System can update leads"
    ON leads FOR UPDATE
    USING (true); -- System updates only

-- Email templates policies (admins only)
CREATE POLICY "Admins can manage email templates"
    ON email_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.clerk_id = auth.jwt() ->> 'sub'
            AND users.role IN ('super_admin', 'enterprise_admin')
        )
    );

-- Email sends policies (admins can see all)
CREATE POLICY "Admins can view email sends"
    ON email_sends FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.clerk_id = auth.jwt() ->> 'sub'
            AND users.role IN ('super_admin', 'enterprise_admin')
        )
    );

CREATE POLICY "System can insert email sends"
    ON email_sends FOR INSERT
    WITH CHECK (true);

-- Scan history policies (public reads for demo)
CREATE POLICY "Anyone can view recent scans"
    ON scan_history FOR SELECT
    USING (created_at > NOW() - INTERVAL '7 days');

CREATE POLICY "System can insert scans"
    ON scan_history FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. UTILITY FUNCTIONS
-- =====================================================

-- Function to score leads based on engagement
CREATE OR REPLACE FUNCTION calculate_lead_score(p_lead_id UUID) RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_lead RECORD;
BEGIN
    SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

    -- Base score
    v_score := 10;

    -- Multiple scans (+10 per scan, max 30)
    v_score := v_score + LEAST(v_lead.scans_completed * 10, 30);

    -- Report unlocked (+20)
    IF v_lead.report_unlocked THEN
        v_score := v_score + 20;
    END IF;

    -- Email verified (+15)
    IF v_lead.email_verified THEN
        v_score := v_score + 15;
    END IF;

    -- Recent activity (+10 if active in last 24h)
    IF v_lead.last_activity_at > NOW() - INTERVAL '24 hours' THEN
        v_score := v_score + 10;
    END IF;

    -- Has phone (+10)
    IF v_lead.phone IS NOT NULL THEN
        v_score := v_score + 10;
    END IF;

    -- Email opened (+5)
    IF EXISTS (
        SELECT 1 FROM email_sends
        WHERE lead_id = p_lead_id AND opened_at IS NOT NULL
    ) THEN
        v_score := v_score + 5;
    END IF;

    RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to get next nurture batch
CREATE OR REPLACE FUNCTION get_nurture_batch(
    p_stage INTEGER DEFAULT 0,
    p_batch_size INTEGER DEFAULT 100
) RETURNS TABLE (
    id UUID,
    email TEXT,
    dealer TEXT,
    stage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.email,
        l.dealer,
        l.nurture_sequence_stage
    FROM leads l
    WHERE l.nurture_opt_out = false
    AND l.converted = false
    AND l.nurture_sequence_stage = p_stage
    AND (
        -- Day 0: Send immediately after capture
        (p_stage = 0 AND l.welcome_email_sent = false) OR
        -- Day 1: Send 24h after signup
        (p_stage = 1 AND l.created_at < NOW() - INTERVAL '24 hours' AND l.created_at > NOW() - INTERVAL '25 hours') OR
        -- Day 3: Send 72h after signup
        (p_stage = 2 AND l.created_at < NOW() - INTERVAL '72 hours' AND l.created_at > NOW() - INTERVAL '73 hours') OR
        -- Day 7: Send 7d after signup
        (p_stage = 3 AND l.created_at < NOW() - INTERVAL '7 days' AND l.created_at > NOW() - INTERVAL '7 days 1 hour')
    )
    ORDER BY l.created_at DESC
    LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. SEED EMAIL TEMPLATES
-- =====================================================

INSERT INTO email_templates (name, subject, template_type, html_body, text_body, variables, variant) VALUES
(
    'welcome',
    'Your AI Visibility Report is Ready',
    'welcome',
    '<h1>Hi there!</h1><p>Thanks for running your AI visibility scan for <strong>{{dealer}}</strong>.</p><p>Your scores:</p><ul><li>Zero-Click: {{zero_click}}%</li><li>AI Visibility: {{ai_visibility}}%</li><li>Revenue at Risk: ${{revenue_at_risk}}</li></ul><p><a href="{{dashboard_url}}">View Full Report</a></p>',
    'Hi there!\n\nThanks for running your AI visibility scan for {{dealer}}.\n\nYour scores:\n- Zero-Click: {{zero_click}}%\n- AI Visibility: {{ai_visibility}}%\n- Revenue at Risk: ${{revenue_at_risk}}\n\nView Full Report: {{dashboard_url}}',
    '["dealer", "zero_click", "ai_visibility", "revenue_at_risk", "dashboard_url"]'::jsonb,
    'control'
),
(
    'nurture_day1',
    'Quick question about {{dealer}}',
    'nurture_day1',
    '<h1>Quick follow-up</h1><p>I noticed you scanned {{dealer}} yesterday. Did you get a chance to review your AI visibility report?</p><p>Most dealerships see a 15-20% lift in organic traffic within 30 days by fixing the top 3 issues we flagged.</p><p><a href="{{dashboard_url}}">See your top issues</a></p>',
    'Quick follow-up\n\nI noticed you scanned {{dealer}} yesterday. Did you get a chance to review your AI visibility report?\n\nMost dealerships see a 15-20% lift in organic traffic within 30 days by fixing the top 3 issues we flagged.\n\nSee your top issues: {{dashboard_url}}',
    '["dealer", "dashboard_url"]'::jsonb,
    'control'
),
(
    'nurture_day3',
    'Your competitors are ahead in AI visibility',
    'nurture_day3',
    '<h1>Don''t fall behind</h1><p>{{dealer}} is at {{ai_visibility}}% AI visibility, but your market average is {{market_avg}}%.</p><p>That gap means ~${{revenue_gap}}/month in lost revenue.</p><p><a href="{{signup_url}}">Fix this in 10 minutes</a></p>',
    'Don''t fall behind\n\n{{dealer}} is at {{ai_visibility}}% AI visibility, but your market average is {{market_avg}}%.\n\nThat gap means ~${{revenue_gap}}/month in lost revenue.\n\nFix this in 10 minutes: {{signup_url}}',
    '["dealer", "ai_visibility", "market_avg", "revenue_gap", "signup_url"]'::jsonb,
    'control'
),
(
    'nurture_day7',
    'Last chance: {{dealer}} AI visibility report expires soon',
    'nurture_day7',
    '<h1>Your report expires in 48 hours</h1><p>After that, you''ll need to re-scan {{dealer}}.</p><p>Don''t lose access to:</p><ul><li>AI visibility breakdown by platform</li><li>Zero-click opportunities</li><li>Schema fix recommendations</li></ul><p><a href="{{dashboard_url}}">View report before it expires</a></p>',
    'Your report expires in 48 hours\n\nAfter that, you''ll need to re-scan {{dealer}}.\n\nDon''t lose access to:\n- AI visibility breakdown by platform\n- Zero-click opportunities\n- Schema fix recommendations\n\nView report before it expires: {{dashboard_url}}',
    '["dealer", "dashboard_url"]'::jsonb,
    'control'
)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE leads IS 'Lead capture and conversion tracking for PLG funnel';
COMMENT ON TABLE email_templates IS 'Email templates for automated nurture sequences';
COMMENT ON TABLE email_sends IS 'Audit trail of all emails sent to leads';
COMMENT ON TABLE scan_history IS 'Historical record of all instant scans performed';

COMMENT ON COLUMN leads.score IS 'Calculated lead score (0-100) based on engagement';
COMMENT ON COLUMN leads.nurture_sequence_stage IS 'Current stage in nurture sequence: 0=welcome, 1=day1, 2=day3, 3=day7';
COMMENT ON COLUMN email_templates.variables IS 'List of variables available for template interpolation';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
