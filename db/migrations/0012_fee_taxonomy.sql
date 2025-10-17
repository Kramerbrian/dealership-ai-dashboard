-- Fee Taxonomy for Offer Integrity Auditing
-- DealershipAI - Dishonest Pricing Compliance System

CREATE TABLE IF NOT EXISTS fee_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,                -- DOC_FEE, DEST, ADM, ETCH, NITRO, ACCESSORY, OTHER
  label text NOT NULL,
  disclosure_required boolean DEFAULT true,
  allowed_on_new boolean DEFAULT true,
  allowed_on_used boolean DEFAULT true,
  max_usd numeric(10,2),                    -- optional cap
  created_at timestamptz DEFAULT now()
);

-- Insert standard fee taxonomy
INSERT INTO fee_taxonomy (code, label, disclosure_required, allowed_on_new, allowed_on_used, max_usd) VALUES
('DOC_FEE', 'Document Fee', true, true, true, 999),
('DEST', 'Destination', true, true, false, 3995),
('ADM', 'Additional Dealer Markup', true, true, true, NULL),
('ETCH', 'VIN Etch', true, true, true, 699),
('NITRO', 'Nitrogen', true, true, true, 399),
('ACCESSORY', 'Dealer Accessories', true, true, true, NULL),
('TAX', 'Sales Tax', true, true, true, NULL),
('TITLE', 'Title & Registration', true, true, true, 500),
('LICENSE', 'License Fee', true, true, true, 200),
('OTHER', 'Other Fees', true, true, true, NULL)
ON CONFLICT (code) DO NOTHING;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_fee_taxonomy_code ON fee_taxonomy(code);

-- Enable RLS
ALTER TABLE fee_taxonomy ENABLE ROW LEVEL SECURITY;

-- Create policy for multi-tenant access
DO $$ 
BEGIN
  CREATE POLICY fee_taxonomy_select ON fee_taxonomy FOR SELECT USING (true);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;