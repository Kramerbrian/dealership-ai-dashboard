-- DealershipAI Database Schema
-- This file contains all the necessary tables for the DealershipAI platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'enterprise_admin', 'dealership_admin', 'user');
CREATE TYPE audit_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE optimization_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Tenants table (multi-tenant architecture)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Dealerships table
CREATE TABLE dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    website_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- AI Visibility Audits table
CREATE TABLE ai_visibility_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    status audit_status DEFAULT 'pending',
    
    -- AI Visibility Scores
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),
    zero_click_score INTEGER CHECK (zero_click_score >= 0 AND zero_click_score <= 100),
    ugc_health_score INTEGER CHECK (ugc_health_score >= 0 AND ugc_health_score <= 100),
    geo_trust_score INTEGER CHECK (geo_trust_score >= 0 AND geo_trust_score <= 100),
    sgp_integrity_score INTEGER CHECK (sgp_integrity_score >= 0 AND sgp_integrity_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Trust Scores
    authority_score INTEGER CHECK (authority_score >= 0 AND authority_score <= 100),
    expertise_score INTEGER CHECK (expertise_score >= 0 AND expertise_score <= 100),
    experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100),
    transparency_score INTEGER CHECK (transparency_score >= 0 AND transparency_score <= 100),
    consistency_score INTEGER CHECK (consistency_score >= 0 AND consistency_score <= 100),
    freshness_score INTEGER CHECK (freshness_score >= 0 AND freshness_score <= 100),
    overall_trust_score INTEGER CHECK (overall_trust_score >= 0 AND overall_trust_score <= 100),
    
    -- Metadata
    audit_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Optimization Recommendations table
CREATE TABLE optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES ai_visibility_audits(id) ON DELETE CASCADE,
    
    -- Recommendation details
    actionable_win TEXT NOT NULL,
    opportunity TEXT NOT NULL,
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
    explanation TEXT NOT NULL,
    
    -- Categorization
    category VARCHAR(50) CHECK (category IN ('seo', 'aeo', 'geo', 'ai_visibility', 'content', 'technical', 'local')),
    priority optimization_priority DEFAULT 'medium',
    effort_level VARCHAR(20) CHECK (effort_level IN ('low', 'medium', 'high')),
    impact_level VARCHAR(20) CHECK (impact_level IN ('low', 'medium', 'high')),
    
    -- Implementation details
    estimated_time VARCHAR(50),
    required_skills TEXT[],
    tools_needed TEXT[],
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Citations tracking table
CREATE TABLE ai_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Citation details
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google_sge')),
    query TEXT NOT NULL,
    response_text TEXT,
    citation_position INTEGER,
    confidence_score DECIMAL(3,2),
    
    -- Metadata
    citation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor Analysis table
CREATE TABLE competitor_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Competitor details
    competitor_name VARCHAR(255) NOT NULL,
    competitor_domain VARCHAR(255),
    competitor_score INTEGER CHECK (competitor_score >= 0 AND competitor_score <= 100),
    
    -- Analysis data
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Feed table
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    message TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_dealerships_tenant_id ON dealerships(tenant_id);
CREATE INDEX idx_dealerships_domain ON dealerships(domain);
CREATE INDEX idx_audits_dealership_id ON ai_visibility_audits(dealership_id);
CREATE INDEX idx_audits_tenant_id ON ai_visibility_audits(tenant_id);
CREATE INDEX idx_audits_created_at ON ai_visibility_audits(created_at);
CREATE INDEX idx_recommendations_dealership_id ON optimization_recommendations(dealership_id);
CREATE INDEX idx_recommendations_tenant_id ON optimization_recommendations(tenant_id);
CREATE INDEX idx_citations_dealership_id ON ai_citations(dealership_id);
CREATE INDEX idx_citations_platform ON ai_citations(platform);
CREATE INDEX idx_citations_created_at ON ai_citations(created_at);
CREATE INDEX idx_competitor_analysis_dealership_id ON competitor_analysis(dealership_id);
CREATE INDEX idx_activity_feed_tenant_id ON activity_feed(tenant_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation
CREATE POLICY "Users can only see their tenant data" ON users
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Dealerships are isolated by tenant" ON dealerships
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Audits are isolated by tenant" ON ai_visibility_audits
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Recommendations are isolated by tenant" ON optimization_recommendations
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Citations are isolated by tenant" ON ai_citations
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Competitor analysis is isolated by tenant" ON competitor_analysis
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Activity feed is isolated by tenant" ON activity_feed
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON dealerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON ai_visibility_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON optimization_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_analysis_updated_at BEFORE UPDATE ON competitor_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO tenants (name, domain) VALUES 
('DealershipAI Demo', 'demo.dealershipai.com'),
('Enterprise Customer', 'enterprise.dealershipai.com');

-- Insert sample dealerships
INSERT INTO dealerships (tenant_id, name, domain, website_url, city, state, phone, email) VALUES 
((SELECT id FROM tenants WHERE domain = 'demo.dealershipai.com'), 'ABC Toyota', 'abctoyota.com', 'https://abctoyota.com', 'Austin', 'TX', '(555) 123-4567', 'info@abctoyota.com'),
((SELECT id FROM tenants WHERE domain = 'demo.dealershipai.com'), 'Honda Center', 'hondacenter.com', 'https://hondacenter.com', 'Dallas', 'TX', '(555) 234-5678', 'info@hondacenter.com'),
((SELECT id FROM tenants WHERE domain = 'demo.dealershipai.com'), 'BMW of Texas', 'bmwoftexas.com', 'https://bmwoftexas.com', 'Houston', 'TX', '(555) 345-6789', 'info@bmwoftexas.com');

-- ========================================
-- AUDIT LOG SCHEMA (Compliance)
-- ========================================
-- DealershipAI Audit Log Schema
-- Run in Supabase SQL editor

-- Create audit_log table with append-only behavior
create table if not exists audit_log (
  id            bigserial primary key,
  tenant_id     uuid not null,
  agent_id      text not null,
  model_version text not null,
  prompt_hash   text not null,
  action_type   text not null,
  entity_type   text not null,
  entity_id     text not null,
  inputs_ptr    jsonb not null,    -- pointers/ids only
  outputs_json  jsonb not null,    -- exact write payload
  rationale     text,              -- concise why
  confidence    numeric(4,3) not null,
  policy_check  jsonb not null,    -- {contract_id, pass, violations: []}
  human_override jsonb,            -- {by, reason, delta}
  retention_class text not null check (retention_class in ('A','B','C')),
  occurred_at   timestamptz not null default now()
);

-- Append-only: block UPDATE/DELETE
create or replace function audit_log_no_mutations() returns trigger as $$
begin
  if (TG_OP = 'UPDATE' or TG_OP = 'DELETE') then
    raise exception 'audit_log is append-only';
  end if;
  return null;
end; $$ language plpgsql;

create trigger audit_log_no_update
  before update on audit_log for each statement execute function audit_log_no_mutations();
create trigger audit_log_no_delete
  before delete on audit_log for each statement execute function audit_log_no_mutations();

-- Minimal indexes for performance
create index if not exists idx_audit_tenant_time on audit_log(tenant_id, occurred_at desc);
create index if not exists idx_audit_agent on audit_log(agent_id);
create index if not exists idx_audit_confidence on audit_log(confidence);
create index if not exists idx_audit_policy_check on audit_log using gin(policy_check);

-- Row Level Security (RLS) for tenant isolation
alter table audit_log enable row level security;

-- Policy for tenant isolation (adjust based on your auth setup)
create policy tenant_isolation on audit_log 
  using (tenant_id = auth.uid());

-- View: compliance summary
create or replace view audit_compliance_summary as
select
  tenant_id,
  date_trunc('day', occurred_at) as day,
  count(*) as total_actions,
  sum( (policy_check->>'pass')::boolean::int ) as passes,
  sum( case when (policy_check->>'pass')::boolean = false then 1 else 0 end ) as violations,
  avg(confidence) as avg_confidence,
  sum( case when (policy_check->>'mode') = 'FULL_AUTO' then 1 else 0 end ) as auto_actions,
  sum( case when (policy_check->>'mode') = 'HUMAN_REVIEW' then 1 else 0 end ) as human_reviews
from audit_log
group by 1,2
order by 2 desc;

-- RPC function for compliance metrics
create or replace function compliance_summary_metrics()
returns json as $$
  with base as (
    select
      count(*) as total,
      sum(case when (policy_check->>'mode') = 'FULL_AUTO' then 1 else 0 end) as auto_count,
      sum(case when (policy_check->>'mode') = 'HUMAN_REVIEW' then 1 else 0 end) as human_reviews,
      sum(case when (policy_check->>'pass')::boolean = false then 1 else 0 end) as violations_7d,
      avg(confidence) as avg_confidence
    from audit_log
    where occurred_at >= now() - interval '7 days'
  )
  select json_build_object(
    'auto_pct', round(100.0 * auto_count / nullif(total,0), 1),
    'human_reviews', human_reviews,
    'violations_7d', violations_7d,
    'avg_confidence', avg_confidence
  ) from base;
$$ language sql stable;

-- Sample data for testing (remove in production)
insert into audit_log (
  tenant_id, agent_id, model_version, prompt_hash, action_type, entity_type, entity_id,
  inputs_ptr, outputs_json, rationale, confidence, policy_check, retention_class
) values 
(
  '00000000-0000-0000-0000-000000000001',
  'appraisal-penetration-agent',
  'gpt-4-turbo',
  'abc123def456',
  'create_task',
  'crm.task',
  'task_001',
  '{"roId": "ro_123", "vin": "1HGBH41JXMN109186"}',
  '{"taskType": "appraisal_nudge", "dueAt": "2024-01-16T09:00:00Z", "assignee": "advisor_001"}',
  'High-value service customer with trade-in potential',
  0.92,
  '{"contract_id": "appraisal-penetration-agent", "pass": true, "violations": [], "mode": "FULL_AUTO"}',
  'B'
),
(
  '00000000-0000-0000-0000-000000000001',
  'appraisal-penetration-agent',
  'gpt-4-turbo',
  'def456ghi789',
  'create_task',
  'crm.task',
  'task_002',
  '{"roId": "ro_124", "vin": "1HGBH41JXMN109187"}',
  '{"taskType": "appraisal_nudge", "dueAt": "2024-01-16T10:00:00Z", "assignee": "advisor_002"}',
  'Service customer with high mileage vehicle',
  0.75,
  '{"contract_id": "appraisal-penetration-agent", "pass": false, "violations": ["confidence_below_threshold"], "mode": "HUMAN_REVIEW"}',
  'B'
);
