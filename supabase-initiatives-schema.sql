-- SQL Schema for Initiatives Table in Supabase
-- Run this in your Supabase SQL Editor to create the initiatives table

CREATE TABLE IF NOT EXISTS initiatives (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    target_date TIMESTAMPTZ NOT NULL,
    categories JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    phases JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    key_initiative VARCHAR(10) DEFAULT 'No',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_owner ON initiatives(owner);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_at ON initiatives(created_at DESC);

-- Add comment to table
COMMENT ON TABLE initiatives IS 'Stores portfolio initiatives with their details, phases, and notes';
COMMENT ON COLUMN initiatives.notes IS 'Array of notes/comments with id, text, author, and date';

-- Enable Row Level Security (RLS) - adjust policies based on your authentication setup
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Example policy: Allow all operations for now (adjust based on your auth requirements)
-- For public/demo usage without authentication:
CREATE POLICY "Allow all operations on initiatives" ON initiatives
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- If you have authentication, you might want policies like:
-- CREATE POLICY "Users can view all initiatives" ON initiatives
--     FOR SELECT
--     USING (true);
-- 
-- CREATE POLICY "Users can manage their own initiatives" ON initiatives
--     FOR ALL
--     USING (owner = auth.email())
--     WITH CHECK (owner = auth.email());
