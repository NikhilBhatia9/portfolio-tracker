-- SQL Schema for Activities Table in Supabase
-- Run this in your Supabase SQL Editor to create the activities table

CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    text TEXT NOT NULL,
    meta VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    initiative_id VARCHAR(255),
    initiative_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_initiative_id ON activities(initiative_id);

-- Add comment to table
COMMENT ON TABLE activities IS 'Stores user activities for the Recent Activity section';

-- Enable Row Level Security (RLS) - adjust policies based on your authentication setup
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Example policy: Allow all operations for now (adjust based on your auth requirements)
-- For public/demo usage without authentication:
CREATE POLICY "Allow all operations on activities" ON activities
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- If you have authentication, you might want policies like:
-- CREATE POLICY "Users can view all activities" ON activities
--     FOR SELECT
--     USING (true);
-- 
-- CREATE POLICY "Users can insert activities" ON activities
--     FOR INSERT
--     WITH CHECK (true);
