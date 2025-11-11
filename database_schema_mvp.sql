-- Supabase Database Schema for ROI Calculator (MVP Version)
-- This version works with simple email-based authentication
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROI Calculations Table (MVP - uses email as user_id)
CREATE TABLE IF NOT EXISTS roi_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,  -- Using email/text for MVP
    session_name TEXT NOT NULL,
    input_parameters JSONB NOT NULL,
    calculated_results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Queries/Activity Log Table (for analytics)
CREATE TABLE IF NOT EXISTS user_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,  -- Using email/text for MVP
    query_type TEXT NOT NULL,
    query_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roi_calculations_user_id ON roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_created_at ON roi_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_timestamp ON user_queries(timestamp DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
CREATE TRIGGER update_roi_calculations_updated_at BEFORE UPDATE ON roi_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: For MVP, we're not using RLS (Row Level Security) since we're using simple email auth
-- For production, use the full database_schema.sql with proper Supabase Auth

