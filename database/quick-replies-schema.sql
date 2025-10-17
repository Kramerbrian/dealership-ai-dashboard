-- Quick Replies Schema for Automotive Dealerships
-- This schema supports AI-powered quick reply suggestions for sales and service teams

-- Quick Replies table
CREATE TABLE IF NOT EXISTS quick_replies (
  id TEXT PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'greeting', 'vehicle_inquiry', 'pricing', 'service', 'follow_up',
    'objection_handling', 'urgency', 'closing', 'general'
  )),
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Reply Templates table (for generating new replies)
CREATE TABLE IF NOT EXISTS quick_reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  category TEXT NOT NULL,
  template_text TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  usage_frequency INTEGER DEFAULT 0,
  success_rate NUMERIC(3,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Reply Analytics table (for tracking performance)
CREATE TABLE IF NOT EXISTS quick_reply_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  reply_id TEXT NOT NULL,
  user_id TEXT,
  conversation_id TEXT,
  response_time_seconds INTEGER,
  customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score >= 1 AND customer_satisfaction_score <= 5),
  conversion_outcome TEXT CHECK (conversion_outcome IN ('lead', 'appointment', 'sale', 'service', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_replies_tenant_id ON quick_replies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_category ON quick_replies(category);
CREATE INDEX IF NOT EXISTS idx_quick_replies_usage_count ON quick_replies(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_quick_replies_active ON quick_replies(is_active);
CREATE INDEX IF NOT EXISTS idx_quick_replies_tags ON quick_replies USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_quick_reply_templates_tenant_id ON quick_reply_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quick_reply_templates_category ON quick_reply_templates(category);
CREATE INDEX IF NOT EXISTS idx_quick_reply_templates_success_rate ON quick_reply_templates(success_rate DESC);

CREATE INDEX IF NOT EXISTS idx_quick_reply_analytics_tenant_id ON quick_reply_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quick_reply_analytics_reply_id ON quick_reply_analytics(reply_id);
CREATE INDEX IF NOT EXISTS idx_quick_reply_analytics_created_at ON quick_reply_analytics(created_at DESC);

-- RLS Policies
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_reply_analytics ENABLE ROW LEVEL SECURITY;

-- Quick Replies policies
CREATE POLICY "Users can view their own quick_replies" ON quick_replies
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own quick_replies" ON quick_replies
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can update their own quick_replies" ON quick_replies
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can delete their own quick_replies" ON quick_replies
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Quick Reply Templates policies
CREATE POLICY "Users can view their own quick_reply_templates" ON quick_reply_templates
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true) OR tenant_id IS NULL);

CREATE POLICY "Users can insert their own quick_reply_templates" ON quick_reply_templates
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true) OR tenant_id IS NULL);

CREATE POLICY "Users can update their own quick_reply_templates" ON quick_reply_templates
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', true) OR tenant_id IS NULL);

-- Quick Reply Analytics policies
CREATE POLICY "Users can view their own quick_reply_analytics" ON quick_reply_analytics
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own quick_reply_analytics" ON quick_reply_analytics
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_quick_replies_updated_at BEFORE UPDATE ON quick_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_reply_templates_updated_at BEFORE UPDATE ON quick_reply_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
CREATE OR REPLACE VIEW quick_reply_performance AS
SELECT 
  qr.tenant_id,
  qr.category,
  COUNT(qra.id) as total_uses,
  AVG(qra.response_time_seconds) as avg_response_time,
  AVG(qra.customer_satisfaction_score) as avg_satisfaction,
  COUNT(qra.id) FILTER (WHERE qra.conversion_outcome != 'none') as conversions,
  ROUND(
    (COUNT(qra.id) FILTER (WHERE qra.conversion_outcome != 'none')::NUMERIC / 
     NULLIF(COUNT(qra.id), 0)) * 100, 2
  ) as conversion_rate
FROM quick_replies qr
LEFT JOIN quick_reply_analytics qra ON qr.id = qra.reply_id
WHERE qr.is_active = TRUE
GROUP BY qr.tenant_id, qr.category;

CREATE OR REPLACE VIEW top_quick_replies AS
SELECT 
  qr.tenant_id,
  qr.id,
  qr.name,
  qr.content,
  qr.category,
  qr.usage_count,
  AVG(qra.customer_satisfaction_score) as avg_satisfaction,
  COUNT(qra.id) FILTER (WHERE qra.conversion_outcome != 'none') as conversions
FROM quick_replies qr
LEFT JOIN quick_reply_analytics qra ON qr.id = qra.reply_id
WHERE qr.is_active = TRUE
GROUP BY qr.tenant_id, qr.id, qr.name, qr.content, qr.category, qr.usage_count
ORDER BY qr.usage_count DESC, conversions DESC;

-- Function to get suggested quick replies based on context
CREATE OR REPLACE FUNCTION get_suggested_quick_replies(
  p_tenant_id UUID,
  p_category TEXT DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  content TEXT,
  category TEXT,
  usage_count INTEGER,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qr.id,
    qr.name,
    qr.content,
    qr.category,
    qr.usage_count,
    CASE 
      WHEN p_search_term IS NOT NULL AND qr.content ILIKE '%' || p_search_term || '%' THEN 1.0
      WHEN p_category IS NOT NULL AND qr.category = p_category THEN 0.8
      ELSE 0.5
    END as relevance_score
  FROM quick_replies qr
  WHERE qr.tenant_id = p_tenant_id
    AND qr.is_active = TRUE
    AND (p_category IS NULL OR qr.category = p_category)
    AND (p_search_term IS NULL OR qr.content ILIKE '%' || p_search_term || '%')
  ORDER BY relevance_score DESC, qr.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert default templates
INSERT INTO quick_reply_templates (tenant_id, category, template_text, variables) VALUES
(NULL, 'greeting', 'Thank you for your interest! How can I help you today?', '{}'),
(NULL, 'greeting', 'Hello! I''m here to assist you with any questions about our vehicles.', '{}'),
(NULL, 'vehicle_inquiry', 'That''s a great choice! Let me get you more details on that vehicle.', '{}'),
(NULL, 'vehicle_inquiry', 'I''d be happy to show you that vehicle. When would be a good time to visit?', '{}'),
(NULL, 'pricing', 'I''d be happy to discuss pricing options with you. Let me prepare some numbers.', '{}'),
(NULL, 'pricing', 'We have competitive financing options available. Would you like to hear more?', '{}'),
(NULL, 'service', 'I can help you schedule a service appointment. What type of service do you need?', '{}'),
(NULL, 'service', 'Our service department is excellent. Let me connect you with our service team.', '{}'),
(NULL, 'follow_up', 'Thank you for your time today! I''ll follow up with you tomorrow.', '{}'),
(NULL, 'follow_up', 'I''ll send you those details via email shortly.', '{}'),
(NULL, 'objection_handling', 'I understand your concern. Let me address that for you.', '{}'),
(NULL, 'objection_handling', 'That''s a valid point. Here''s how we can work around that.', '{}'),
(NULL, 'urgency', 'This vehicle is in high demand. I''d recommend acting quickly.', '{}'),
(NULL, 'urgency', 'We have limited inventory on this model. Would you like to reserve it?', '{}'),
(NULL, 'closing', 'Are you ready to make this vehicle yours today?', '{}'),
(NULL, 'closing', 'What would it take to get you driving this vehicle home today?', '{}');
