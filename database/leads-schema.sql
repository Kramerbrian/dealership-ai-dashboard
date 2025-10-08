-- Leads table for DealershipAI landing page
-- Stores form submissions from the Sentaiment-style landing page

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  website TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  challenge TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(100) DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_website ON leads(website);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_role ON leads(role);
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads(location);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (
    email IN (
      SELECT email FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Service role can manage all leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample data for testing
INSERT INTO leads (business_name, website, location, role, email, phone, challenge, consent, status, source) VALUES
  ('ABC Motors', 'https://abcmotors.com', 'Cape Coral, FL', 'owner', 'owner@abcmotors.com', '(239) 555-0123', 'Struggling with online visibility', true, 'new', 'landing_page'),
  ('XYZ Auto Group', 'https://xyzautogroup.com', 'Fort Myers, FL', 'general_manager', 'gm@xyzautogroup.com', '(239) 555-0456', 'Need better AI search presence', true, 'new', 'landing_page'),
  ('Sunshine Dealership', 'https://sunshinedealership.com', 'Naples, FL', 'marketing_manager', 'marketing@sunshinedealership.com', '(239) 555-0789', 'Competitors ranking higher', true, 'new', 'landing_page'),
  ('Coastal Cars', 'https://coastalcars.com', 'Sarasota, FL', 'digital_manager', 'digital@coastalcars.com', '(941) 555-0321', 'Want to understand AI search', true, 'new', 'landing_page'),
  ('Gulf Coast Auto', 'https://gulfcoastauto.com', 'Tampa, FL', 'owner', 'owner@gulfcoastauto.com', '(813) 555-0654', 'Looking for competitive advantage', true, 'new', 'landing_page')
ON CONFLICT DO NOTHING;

-- Create a view for lead analytics
CREATE OR REPLACE VIEW lead_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_leads,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT website) as unique_businesses,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN role = 'general_manager' THEN 1 END) as general_managers,
  COUNT(CASE WHEN role = 'marketing_manager' THEN 1 END) as marketing_managers,
  COUNT(CASE WHEN role = 'digital_manager' THEN 1 END) as digital_managers,
  COUNT(CASE WHEN challenge IS NOT NULL THEN 1 END) as with_challenges,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_phone
FROM leads
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create a function to get lead metrics
CREATE OR REPLACE FUNCTION get_lead_metrics(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_leads BIGINT,
  unique_businesses BIGINT,
  unique_emails BIGINT,
  most_common_role TEXT,
  most_common_location TEXT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_leads,
    COUNT(DISTINCT website) as unique_businesses,
    COUNT(DISTINCT email) as unique_emails,
    (SELECT role FROM leads 
     WHERE created_at >= NOW() - INTERVAL '1 day' * p_days
     GROUP BY role 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_common_role,
    (SELECT location FROM leads 
     WHERE created_at >= NOW() - INTERVAL '1 day' * p_days
     GROUP BY location 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_common_location,
    (COUNT(*)::NUMERIC / GREATEST(COUNT(*) * 20, 1)) * 100 as conversion_rate
  FROM leads
  WHERE created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get challenge analysis
CREATE OR REPLACE FUNCTION get_challenge_analysis(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  keyword TEXT,
  frequency BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(string_to_array(lower(challenge), ' ')) as keyword,
    COUNT(*) as frequency
  FROM leads
  WHERE created_at >= NOW() - INTERVAL '1 day' * p_days
    AND challenge IS NOT NULL
    AND length(challenge) > 0
  GROUP BY unnest(string_to_array(lower(challenge), ' '))
  HAVING length(unnest(string_to_array(lower(challenge), ' '))) > 3
  ORDER BY COUNT(*) DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
