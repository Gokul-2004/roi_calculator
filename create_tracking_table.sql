-- Table for tracking calculation visits with IP addresses
CREATE TABLE IF NOT EXISTS calculation_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- IP and browser information
  ip_address VARCHAR(45) NOT NULL,  -- IPv6 can be up to 45 chars
  user_agent TEXT,
  referrer TEXT,
  
  -- Input parameters (stored as JSONB for flexibility)
  input_parameters JSONB NOT NULL,
  
  -- Calculated results (stored as JSONB)
  calculated_results JSONB NOT NULL,
  
  -- Key metrics stored separately for easier querying/analytics
  documents_per_year BIGINT,
  pages_per_document NUMERIC,
  annual_savings NUMERIC,
  year1_roi_percent NUMERIC,
  total_paper_cost NUMERIC,
  total_esig_cost NUMERIC,
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_calculation_tracking_ip ON calculation_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_calculation_tracking_calculated_at ON calculation_tracking(calculated_at);
CREATE INDEX IF NOT EXISTS idx_calculation_tracking_documents_per_year ON calculation_tracking(documents_per_year);
CREATE INDEX IF NOT EXISTS idx_calculation_tracking_annual_savings ON calculation_tracking(annual_savings);

-- Enable RLS (Row Level Security)
ALTER TABLE calculation_tracking ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous inserts (needed for tracking to work)
CREATE POLICY "Allow anonymous inserts" ON calculation_tracking
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy to allow service role to read (for admin access)
CREATE POLICY "Allow service role access" ON calculation_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

