-- Compliance Assessment Database Schema
-- Extends the existing DealershipAI database with compliance tracking

-- Compliance assessment types
CREATE TYPE compliance_question_type AS ENUM (
  'security',
  'seo', 
  'aeo',
  'ai_visibility',
  'general'
);

CREATE TYPE compliance_status AS ENUM (
  'yes',
  'no'
);

CREATE TYPE risk_level AS ENUM (
  'low',
  'medium', 
  'high',
  'critical'
);

-- Main compliance assessments table
CREATE TABLE compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id VARCHAR(255) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  question_type compliance_question_type NOT NULL,
  
  -- Assessment data
  messages JSONB NOT NULL, -- Array of message objects
  compliant compliance_status NOT NULL,
  explanation TEXT NOT NULL,
  
  -- Scoring and analysis
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_level risk_level NOT NULL,
  recommendations TEXT[], -- Array of recommendation strings
  
  -- Metadata
  assessed_by UUID NOT NULL REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT fk_compliance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_compliance_dealer FOREIGN KEY (dealer_id) REFERENCES dealerships(id),
  CONSTRAINT fk_compliance_assessor FOREIGN KEY (assessed_by) REFERENCES users(id)
);

-- Compliance metrics aggregation table
CREATE TABLE compliance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  -- Aggregated metrics
  total_assessments INTEGER DEFAULT 0,
  compliant_count INTEGER DEFAULT 0,
  non_compliant_count INTEGER DEFAULT 0,
  compliant_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Risk distribution
  low_risk_count INTEGER DEFAULT 0,
  medium_risk_count INTEGER DEFAULT 0,
  high_risk_count INTEGER DEFAULT 0,
  critical_risk_count INTEGER DEFAULT 0,
  
  -- Average scores
  average_confidence DECIMAL(3,2) DEFAULT 0,
  
  -- Time tracking
  last_assessment_date TIMESTAMP WITH TIME ZONE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_metrics_dealer FOREIGN KEY (dealer_id) REFERENCES dealerships(id),
  UNIQUE(tenant_id, dealer_id, period_start, period_end)
);

-- Compliance templates for common questions
CREATE TABLE compliance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Template details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  question_type compliance_question_type NOT NULL,
  
  -- Template content
  question_text TEXT NOT NULL,
  expected_compliant compliance_status,
  guidance_text TEXT,
  keywords TEXT[], -- Keywords to look for in explanations
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_template_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_template_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Compliance alerts for high-risk assessments
CREATE TABLE compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES compliance_assessments(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type VARCHAR(50) NOT NULL, -- 'high_risk', 'non_compliant', 'low_confidence'
  severity risk_level NOT NULL,
  message TEXT NOT NULL,
  
  -- Status tracking
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_alert_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_alert_dealer FOREIGN KEY (dealer_id) REFERENCES dealerships(id),
  CONSTRAINT fk_alert_assessment FOREIGN KEY (assessment_id) REFERENCES compliance_assessments(id),
  CONSTRAINT fk_alert_resolver FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_compliance_assessments_tenant_id ON compliance_assessments(tenant_id);
CREATE INDEX idx_compliance_assessments_dealer_id ON compliance_assessments(dealer_id);
CREATE INDEX idx_compliance_assessments_timestamp ON compliance_assessments(timestamp DESC);
CREATE INDEX idx_compliance_assessments_question_type ON compliance_assessments(question_type);
CREATE INDEX idx_compliance_assessments_risk_level ON compliance_assessments(risk_level);
CREATE INDEX idx_compliance_assessments_compliant ON compliance_assessments(compliant);

CREATE INDEX idx_compliance_metrics_tenant_id ON compliance_metrics(tenant_id);
CREATE INDEX idx_compliance_metrics_dealer_id ON compliance_metrics(dealer_id);
CREATE INDEX idx_compliance_metrics_period ON compliance_metrics(period_start, period_end);

CREATE INDEX idx_compliance_templates_tenant_id ON compliance_templates(tenant_id);
CREATE INDEX idx_compliance_templates_question_type ON compliance_templates(question_type);
CREATE INDEX idx_compliance_templates_active ON compliance_templates(is_active);

CREATE INDEX idx_compliance_alerts_tenant_id ON compliance_alerts(tenant_id);
CREATE INDEX idx_compliance_alerts_dealer_id ON compliance_alerts(dealer_id);
CREATE INDEX idx_compliance_alerts_resolved ON compliance_alerts(is_resolved);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);

-- Row Level Security (RLS) policies
ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_assessments
CREATE POLICY "Users can view compliance assessments for their tenant" ON compliance_assessments
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can create compliance assessments for their tenant" ON compliance_assessments
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can update compliance assessments for their tenant" ON compliance_assessments
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for compliance_metrics
CREATE POLICY "Users can view compliance metrics for their tenant" ON compliance_metrics
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for compliance_templates
CREATE POLICY "Users can view compliance templates for their tenant" ON compliance_templates
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can manage compliance templates for their tenant" ON compliance_templates
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for compliance_alerts
CREATE POLICY "Users can view compliance alerts for their tenant" ON compliance_alerts
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can manage compliance alerts for their tenant" ON compliance_alerts
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Functions for automatic metric calculation
CREATE OR REPLACE FUNCTION update_compliance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert metrics for the tenant/dealer combination
  INSERT INTO compliance_metrics (
    tenant_id,
    dealer_id,
    total_assessments,
    compliant_count,
    non_compliant_count,
    compliant_percentage,
    low_risk_count,
    medium_risk_count,
    high_risk_count,
    critical_risk_count,
    average_confidence,
    last_assessment_date,
    period_start,
    period_end
  )
  SELECT 
    NEW.tenant_id,
    NEW.dealer_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE compliant = 'yes'),
    COUNT(*) FILTER (WHERE compliant = 'no'),
    ROUND(
      (COUNT(*) FILTER (WHERE compliant = 'yes')::DECIMAL / COUNT(*)) * 100, 
      2
    ),
    COUNT(*) FILTER (WHERE risk_level = 'low'),
    COUNT(*) FILTER (WHERE risk_level = 'medium'),
    COUNT(*) FILTER (WHERE risk_level = 'high'),
    COUNT(*) FILTER (WHERE risk_level = 'critical'),
    ROUND(AVG(confidence_score), 2),
    MAX(timestamp),
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'
  FROM compliance_assessments
  WHERE tenant_id = NEW.tenant_id 
    AND (dealer_id = NEW.dealer_id OR (NEW.dealer_id IS NULL AND dealer_id IS NULL))
    AND timestamp >= DATE_TRUNC('month', NOW())
  ON CONFLICT (tenant_id, dealer_id, period_start, period_end)
  DO UPDATE SET
    total_assessments = EXCLUDED.total_assessments,
    compliant_count = EXCLUDED.compliant_count,
    non_compliant_count = EXCLUDED.non_compliant_count,
    compliant_percentage = EXCLUDED.compliant_percentage,
    low_risk_count = EXCLUDED.low_risk_count,
    medium_risk_count = EXCLUDED.medium_risk_count,
    high_risk_count = EXCLUDED.high_risk_count,
    critical_risk_count = EXCLUDED.critical_risk_count,
    average_confidence = EXCLUDED.average_confidence,
    last_assessment_date = EXCLUDED.last_assessment_date,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update metrics
CREATE TRIGGER trigger_update_compliance_metrics
  AFTER INSERT ON compliance_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_metrics();

-- Function to create alerts for high-risk assessments
CREATE OR REPLACE FUNCTION create_compliance_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Create alert for high-risk or non-compliant assessments
  IF NEW.risk_level IN ('high', 'critical') OR NEW.compliant = 'no' THEN
    INSERT INTO compliance_alerts (
      tenant_id,
      dealer_id,
      assessment_id,
      alert_type,
      severity,
      message
    ) VALUES (
      NEW.tenant_id,
      NEW.dealer_id,
      NEW.id,
      CASE 
        WHEN NEW.compliant = 'no' THEN 'non_compliant'
        WHEN NEW.risk_level = 'critical' THEN 'critical_risk'
        ELSE 'high_risk'
      END,
      NEW.risk_level,
      CASE 
        WHEN NEW.compliant = 'no' THEN 'Non-compliant assessment detected: ' || NEW.explanation
        WHEN NEW.risk_level = 'critical' THEN 'Critical risk assessment: ' || NEW.explanation
        ELSE 'High risk assessment: ' || NEW.explanation
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create alerts
CREATE TRIGGER trigger_create_compliance_alerts
  AFTER INSERT ON compliance_assessments
  FOR EACH ROW
  EXECUTE FUNCTION create_compliance_alerts();

-- Sample compliance templates
INSERT INTO compliance_templates (tenant_id, name, description, question_type, question_text, expected_compliant, guidance_text, keywords, created_by) VALUES
  (gen_random_uuid(), 'Security Team', 'Do you have a dedicated security team?', 'security', 'Do you have a dedicated security team?', 'yes', 'A dedicated security team follows strict protocols for handling incidents.', ARRAY['security', 'team', 'protocol', 'incident'], gen_random_uuid()),
  (gen_random_uuid(), 'AI Visibility Optimization', 'Search engine agent for AI visibility', 'ai_visibility', 'How do you measure and improve AI search visibility?', 'yes', 'A search engine agent for SEO, AEO, AIO, and Generative Search constantly improves the measurement and calculation of AI search visibility.', ARRAY['seo', 'aeo', 'ai', 'visibility', 'measurement', 'optimization'], gen_random_uuid()),
  (gen_random_uuid(), 'Data Encryption', 'Data encryption at rest and in transit', 'security', 'How is sensitive data encrypted?', 'yes', 'Data should be encrypted both at rest and in transit using industry-standard encryption protocols.', ARRAY['encryption', 'data', 'security', 'protocol'], gen_random_uuid()),
  (gen_random_uuid(), 'SEO Optimization', 'Search engine optimization practices', 'seo', 'What SEO practices do you implement?', 'yes', 'Comprehensive SEO practices including meta tags, structured data, and content optimization.', ARRAY['seo', 'meta', 'structured', 'content', 'optimization'], gen_random_uuid());
