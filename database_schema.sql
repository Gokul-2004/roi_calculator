-- Supabase Database Schema for ROI Calculator
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROI Calculations Table
CREATE TABLE IF NOT EXISTS roi_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_name TEXT NOT NULL,
    input_parameters JSONB NOT NULL,
    calculated_results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Queries/Activity Log Table (for analytics)
CREATE TABLE IF NOT EXISTS user_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    query_type TEXT NOT NULL,
    query_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roi_calculations_user_id ON roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_created_at ON roi_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_timestamp ON user_queries(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies for roi_calculations
CREATE POLICY "Users can view own calculations"
    ON roi_calculations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
    ON roi_calculations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
    ON roi_calculations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
    ON roi_calculations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_queries
CREATE POLICY "Users can insert own queries"
    ON user_queries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own queries"
    ON user_queries FOR SELECT
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roi_calculations_updated_at BEFORE UPDATE ON roi_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, organization_name)
    VALUES (NEW.id, NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

