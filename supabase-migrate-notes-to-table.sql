-- Migration: Move notes from initiatives table to separate notes table
-- Run this if you already have an initiatives table with a notes column

-- Step 1: Create the new notes table (if it doesn't exist)
-- See supabase-notes-schema.sql for the complete schema

-- Step 2: Migrate existing notes data (if any exists)
-- This script extracts notes from the JSONB column and inserts them into the notes table
DO $$
DECLARE
    init_record RECORD;
    note_record JSONB;
BEGIN
    -- Only run if the notes column exists in initiatives table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'initiatives' AND column_name = 'notes'
    ) THEN
        -- Loop through each initiative that has notes
        FOR init_record IN 
            SELECT id, notes FROM initiatives WHERE notes IS NOT NULL AND jsonb_array_length(notes) > 0
        LOOP
            -- Loop through each note in the JSONB array
            FOR note_record IN SELECT * FROM jsonb_array_elements(init_record.notes)
            LOOP
                -- Insert into notes table (handle duplicates gracefully)
                -- Note: JSONB structure uses 'date' field which maps to 'created_at' in database
                INSERT INTO notes (id, initiative_id, text, author, created_at)
                VALUES (
                    (note_record->>'id')::BIGINT,
                    init_record.id,
                    note_record->>'text',
                    note_record->>'author',
                    (note_record->>'date')::TIMESTAMPTZ
                )
                ON CONFLICT (id) DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Notes migration completed successfully';
    ELSE
        RAISE NOTICE 'Notes column does not exist in initiatives table, skipping migration';
    END IF;
END $$;

-- Step 3: Drop the notes column from initiatives table (optional - only after confirming migration)
-- Uncomment the line below after verifying that notes were migrated correctly
-- ALTER TABLE initiatives DROP COLUMN IF EXISTS notes;
