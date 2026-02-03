-- Migration: Add notes column to initiatives table
-- Run this if you already have an initiatives table without the notes column

-- Add the notes column if it doesn't exist
ALTER TABLE initiatives 
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;

-- Add comment to the column
COMMENT ON COLUMN initiatives.notes IS 'Array of notes/comments with id, text, author, and date';
