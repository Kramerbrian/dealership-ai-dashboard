-- AI Optimizer Database Schema
-- Stores AI optimization recommendations with JSON schema validation

-- Optimizer recommendation categories
CREATE TYPE optimizer_category AS ENUM (
  'seo',
  'aeo', 
  'geo',
  'ai_visibility',
  'content',
  'technical',
  'local'
);

CREATE TYPE optimizer_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE effort_level AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE impact_level AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE recommendation_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- Main optimizer recommendations table
CREATE TABLE optimizer_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  
  -- Core optimization data (JSON schema validated)
  actionable_win VARCHAR(200) NOT NULL,
  opportunity VARCHAR(300) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  explanation VARCHAR(500) NOT NULL,
  
  -- Categorization and prioritization
  category optimizer_category NOT NULL,
  priority optimizer_priority NOT NULL,
  effort_level effort_level NOT NULL,
  impact_level impact_level NOT NULL,
  
  -- Implementation details
  estimated_time VARCHAR(50) NOT NULL,
  required_skills TEXT[] NOT NULL,
  tools_needed TEXT[] NOT NULL,
  
  -- Status tracking
  status recommendation_status DEFAULT 'pending',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT fk_optimizer_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_optimizer_dealer FOREIGN KEY (dealer_id) REFERENCES dealerships(id),
  CONSTRAINT fk_optimizer_creator FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_optimizer_completer FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Optimizer metrics aggregation table
CREATE TABLE optimizer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  -- Aggregated metrics
  total_recommendations INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  in_progress_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  cancelled_count INTEGER DEFAULT 0,
  
  -- Priority distribution
  high_priority_count INTEGER DEFAULT 0,
  critical_priority_count INTEGER DEFAULT 0,
  
  -- Category distribution
  seo_count INTEGER DEFAULT 0,
  aeo_count INTEGER DEFAULT 0,
  geo_count INTEGER DEFAULT 0,
  ai_visibility_count INTEGER DEFAULT 0,
  content_count INTEGER DEFAULT 0,
  technical_count INTEGER DEFAULT 0,
  local_count INTEGER DEFAULT 0,
  
  -- Effort and impact distribution
  low_effort_count INTEGER DEFAULT 0,
  medium_effort_count INTEGER DEFAULT 0,
  high_effort_count INTEGER DEFAULT 0,
  
  low_impact_count INTEGER DEFAULT 0,
  medium_impact_count INTEGER DEFAULT 0,
  high_impact_count INTEGER DEFAULT 0,
  
  -- Average scores
  average_score DECIMAL(5,2) DEFAULT 0,
  average_completion_time_days DECIMAL(5,2) DEFAULT 0,
  
  -- Time tracking
  last_recommendation_date TIMESTAMP WITH TIME ZONE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_optimizer_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_optimizer_metrics_dealer FOREIGN KEY (dealer_id) REFERENCES dealerships(id),
  UNIQUE(tenant_id, dealer_id, period_start, period_end)
);

-- Optimizer templates for common recommendations
CREATE TABLE optimizer_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Template details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category optimizer_category NOT NULL,
  
  -- Template content (JSON schema structure)
  actionable_win_template TEXT NOT NULL,
  opportunity_template TEXT NOT NULL,
  explanation_template TEXT NOT NULL,
  
  -- Default values
  default_priority optimizer_priority NOT NULL,
  default_effort_level effort_level NOT NULL,
  default_impact_level impact_level NOT NULL,
  default_estimated_time VARCHAR(50) NOT NULL,
  default_required_skills TEXT[] NOT NULL,
  default_tools_needed TEXT[] NOT NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_optimizer_template_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_optimizer_template_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Optimizer implementation tracking
CREATE TABLE optimizer_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES optimizer_recommendations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  -- Implementation details
  implementation_notes TEXT,
  actual_time_spent VARCHAR(50),
  actual_skills_used TEXT[],
  actual_tools_used TEXT[],
  
  -- Results tracking
  before_score INTEGER,
  after_score INTEGER,
  improvement_achieved INTEGER,
  results_notes TEXT,
  
  -- Status
  status recommendation_status NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  implemented_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_implementation_recommendation FOREIGN KEY (recommendation_id) REFERENCES optimizer_recommendations(id),
  CONSTRAINT fk_implementation_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_implementation_dealer FOREIGN KEY (dealer_id) REFERENCES dealerships(id),
  CONSTRAINT fk_implementation_user FOREIGN KEY (implemented_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_optimizer_recommendations_tenant_id ON optimizer_recommendations(tenant_id);
CREATE INDEX idx_optimizer_recommendations_dealer_id ON optimizer_recommendations(dealer_id);
CREATE INDEX idx_optimizer_recommendations_domain ON optimizer_recommendations(domain);
CREATE INDEX idx_optimizer_recommendations_category ON optimizer_recommendations(category);
CREATE INDEX idx_optimizer_recommendations_priority ON optimizer_recommendations(priority);
CREATE INDEX idx_optimizer_recommendations_status ON optimizer_recommendations(status);
CREATE INDEX idx_optimizer_recommendations_score ON optimizer_recommendations(score DESC);
CREATE INDEX idx_optimizer_recommendations_created_at ON optimizer_recommendations(created_at DESC);

CREATE INDEX idx_optimizer_metrics_tenant_id ON optimizer_metrics(tenant_id);
CREATE INDEX idx_optimizer_metrics_dealer_id ON optimizer_metrics(dealer_id);
CREATE INDEX idx_optimizer_metrics_period ON optimizer_metrics(period_start, period_end);

CREATE INDEX idx_optimizer_templates_tenant_id ON optimizer_templates(tenant_id);
CREATE INDEX idx_optimizer_templates_category ON optimizer_templates(category);
CREATE INDEX idx_optimizer_templates_active ON optimizer_templates(is_active);

CREATE INDEX idx_optimizer_implementations_recommendation_id ON optimizer_implementations(recommendation_id);
CREATE INDEX idx_optimizer_implementations_tenant_id ON optimizer_implementations(tenant_id);
CREATE INDEX idx_optimizer_implementations_dealer_id ON optimizer_implementations(dealer_id);
CREATE INDEX idx_optimizer_implementations_status ON optimizer_implementations(status);

-- Row Level Security (RLS) policies
ALTER TABLE optimizer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizer_implementations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for optimizer_recommendations
CREATE POLICY "Users can view optimizer recommendations for their tenant" ON optimizer_recommendations
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can create optimizer recommendations for their tenant" ON optimizer_recommendations
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can update optimizer recommendations for their tenant" ON optimizer_recommendations
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for optimizer_metrics
CREATE POLICY "Users can view optimizer metrics for their tenant" ON optimizer_metrics
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for optimizer_templates
CREATE POLICY "Users can view optimizer templates for their tenant" ON optimizer_templates
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can manage optimizer templates for their tenant" ON optimizer_templates
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for optimizer_implementations
CREATE POLICY "Users can view optimizer implementations for their tenant" ON optimizer_implementations
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Admins can manage optimizer implementations for their tenant" ON optimizer_implementations
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Functions for automatic metric calculation
CREATE OR REPLACE FUNCTION update_optimizer_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert metrics for the tenant/dealer combination
  INSERT INTO optimizer_metrics (
    tenant_id,
    dealer_id,
    total_recommendations,
    pending_count,
    in_progress_count,
    completed_count,
    cancelled_count,
    high_priority_count,
    critical_priority_count,
    seo_count,
    aeo_count,
    geo_count,
    ai_visibility_count,
    content_count,
    technical_count,
    local_count,
    low_effort_count,
    medium_effort_count,
    high_effort_count,
    low_impact_count,
    medium_impact_count,
    high_impact_count,
    average_score,
    last_recommendation_date,
    period_start,
    period_end
  )
  SELECT 
    NEW.tenant_id,
    NEW.dealer_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'in_progress'),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    COUNT(*) FILTER (WHERE priority = 'high'),
    COUNT(*) FILTER (WHERE priority = 'critical'),
    COUNT(*) FILTER (WHERE category = 'seo'),
    COUNT(*) FILTER (WHERE category = 'aeo'),
    COUNT(*) FILTER (WHERE category = 'geo'),
    COUNT(*) FILTER (WHERE category = 'ai_visibility'),
    COUNT(*) FILTER (WHERE category = 'content'),
    COUNT(*) FILTER (WHERE category = 'technical'),
    COUNT(*) FILTER (WHERE category = 'local'),
    COUNT(*) FILTER (WHERE effort_level = 'low'),
    COUNT(*) FILTER (WHERE effort_level = 'medium'),
    COUNT(*) FILTER (WHERE effort_level = 'high'),
    COUNT(*) FILTER (WHERE impact_level = 'low'),
    COUNT(*) FILTER (WHERE impact_level = 'medium'),
    COUNT(*) FILTER (WHERE impact_level = 'high'),
    ROUND(AVG(score), 2),
    MAX(created_at),
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'
  FROM optimizer_recommendations
  WHERE tenant_id = NEW.tenant_id 
    AND (dealer_id = NEW.dealer_id OR (NEW.dealer_id IS NULL AND dealer_id IS NULL))
    AND created_at >= DATE_TRUNC('month', NOW())
  ON CONFLICT (tenant_id, dealer_id, period_start, period_end)
  DO UPDATE SET
    total_recommendations = EXCLUDED.total_recommendations,
    pending_count = EXCLUDED.pending_count,
    in_progress_count = EXCLUDED.in_progress_count,
    completed_count = EXCLUDED.completed_count,
    cancelled_count = EXCLUDED.cancelled_count,
    high_priority_count = EXCLUDED.high_priority_count,
    critical_priority_count = EXCLUDED.critical_priority_count,
    seo_count = EXCLUDED.seo_count,
    aeo_count = EXCLUDED.aeo_count,
    geo_count = EXCLUDED.geo_count,
    ai_visibility_count = EXCLUDED.ai_visibility_count,
    content_count = EXCLUDED.content_count,
    technical_count = EXCLUDED.technical_count,
    local_count = EXCLUDED.local_count,
    low_effort_count = EXCLUDED.low_effort_count,
    medium_effort_count = EXCLUDED.medium_effort_count,
    high_effort_count = EXCLUDED.high_effort_count,
    low_impact_count = EXCLUDED.low_impact_count,
    medium_impact_count = EXCLUDED.medium_impact_count,
    high_impact_count = EXCLUDED.high_impact_count,
    average_score = EXCLUDED.average_score,
    last_recommendation_date = EXCLUDED.last_recommendation_date,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update metrics
CREATE TRIGGER trigger_update_optimizer_metrics
  AFTER INSERT ON optimizer_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_optimizer_metrics();

-- Function to update recommendation status
CREATE OR REPLACE FUNCTION update_recommendation_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- If status changed to completed, set completed_at and completed_by
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
    -- Note: completed_by should be set by the application
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update status timestamps
CREATE TRIGGER trigger_update_recommendation_status
  BEFORE UPDATE ON optimizer_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_recommendation_status();

-- Sample optimizer templates
INSERT INTO optimizer_templates (tenant_id, name, description, category, actionable_win_template, opportunity_template, explanation_template, default_priority, default_effort_level, default_impact_level, default_estimated_time, default_required_skills, default_tools_needed, created_by) VALUES
  (gen_random_uuid(), 'Structured Data Implementation', 'Add comprehensive structured data markup', 'seo', 'Implement comprehensive structured data markup', 'Add JSON-LD structured data for LocalBusiness, AutoDealer, and Service schemas to improve search engine understanding and local pack visibility', 'Structured data helps search engines understand your business type, services, and location, leading to better local search visibility and rich snippets in search results.', 'high', 'medium', 'high', '4-6 hours', ARRAY['HTML', 'JSON-LD', 'Schema.org'], ARRAY['Google Rich Results Test', 'Schema Markup Validator'], gen_random_uuid()),
  (gen_random_uuid(), 'Featured Snippet Optimization', 'Optimize content for featured snippets', 'aeo', 'Optimize content for featured snippets and zero-click results', 'Create FAQ pages, how-to guides, and structured content that answers common automotive questions to capture featured snippet positions', 'Featured snippets and zero-click results are increasingly important as users get answers directly in search results. Optimizing for these positions can significantly increase visibility.', 'high', 'high', 'high', '1-2 weeks', ARRAY['Content Writing', 'SEO', 'Research'], ARRAY['Answer The Public', 'SEMrush', 'Ahrefs'], gen_random_uuid()),
  (gen_random_uuid(), 'AI Visibility Enhancement', 'Improve AI assistant visibility', 'ai_visibility', 'Enhance AI assistant visibility through content optimization', 'Create comprehensive, authoritative content about automotive services and local market information that AI assistants can reference and cite', 'AI assistants like ChatGPT and Claude increasingly influence consumer decisions. By creating authoritative, well-structured content, you can improve your visibility in AI-generated responses.', 'critical', 'high', 'high', '2-3 weeks', ARRAY['Content Strategy', 'AI Optimization', 'Local SEO'], ARRAY['ChatGPT', 'Claude', 'Content Analysis Tools'], gen_random_uuid());
