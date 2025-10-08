-- Leads table for DealershipAI
-- This table stores lead capture data from the landing page

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(20),
    dealership_name VARCHAR(255),
    dealership_size VARCHAR(50),
    current_challenges TEXT[],
    source VARCHAR(100) DEFAULT 'landing_page',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    region VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Enable RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view leads from their tenant" ON leads
    FOR SELECT USING (
        assigned_to IN (
            SELECT id FROM users WHERE tenant_id = (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update leads they are assigned to" ON leads
    FOR UPDATE USING (
        assigned_to = auth.uid()
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO leads (email, first_name, last_name, company, dealership_name, dealership_size, current_challenges, source, status) VALUES
('demo@example.com', 'John', 'Doe', 'Demo Auto Group', 'Demo Dealership', '50-100', ARRAY['SEO', 'Lead Generation'], 'landing_page', 'new'),
('test@example.com', 'Jane', 'Smith', 'Test Motors', 'Test Dealership', '25-50', ARRAY['Social Media', 'Online Reviews'], 'landing_page', 'contacted'),
('sample@example.com', 'Bob', 'Johnson', 'Sample Cars', 'Sample Dealership', '100+', ARRAY['Competition', 'Pricing'], 'landing_page', 'qualified');
