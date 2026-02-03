-- SQL Schema for Notes Table in Supabase
-- Run this in your Supabase SQL Editor to create the notes table

CREATE TABLE IF NOT EXISTS notes (
    id BIGINT PRIMARY KEY,
    initiative_id BIGINT NOT NULL,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_initiative_id ON notes(initiative_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Add foreign key constraint (optional - only if initiatives table exists)
-- Note: This assumes the initiatives table already exists
-- ALTER TABLE notes
-- ADD CONSTRAINT fk_notes_initiative
-- FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE;

-- Add comment to table
COMMENT ON TABLE notes IS 'Stores notes/comments for portfolio initiatives';
COMMENT ON COLUMN notes.initiative_id IS 'Foreign key reference to initiatives table';

-- Enable Row Level Security (RLS) - adjust policies based on your authentication setup
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Example policy: Allow all operations for now (adjust based on your auth requirements)
-- For public/demo usage without authentication:
CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- If you have authentication, you might want policies like:
-- CREATE POLICY "Users can view all notes" ON notes
--     FOR SELECT
--     USING (true);
-- 
-- CREATE POLICY "Users can manage notes for their initiatives" ON notes
--     FOR ALL
--     USING (
--         EXISTS (
--             SELECT 1 FROM initiatives 
--             WHERE initiatives.id = notes.initiative_id 
--             AND initiatives.owner = auth.email()
--         )
--     )
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM initiatives 
--             WHERE initiatives.id = notes.initiative_id 
--             AND initiatives.owner = auth.email()
--         )
--     );
