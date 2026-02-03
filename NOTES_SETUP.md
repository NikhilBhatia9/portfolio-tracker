# Notes Feature Setup for Supabase

## Overview
This document explains how to set up the separate `notes` table in Supabase for storing initiative notes/comments.

**Important:** Notes are now stored in a **separate `notes` table** rather than as a JSONB column in the initiatives table. This provides better performance, querying capabilities, and follows database normalization best practices.

## Prerequisites
- A Supabase project with the Portfolio Tracker database
- Access to the Supabase SQL Editor
- An existing `initiatives` table

## Setup Instructions

### Option 1: Fresh Installation (No Existing Notes)
If you're setting up notes for the first time:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor section
3. Click "New Query"
4. Copy and paste the SQL from `supabase-notes-schema.sql`
5. Run the query

This creates the `notes` table with proper indexes and constraints.

### Option 2: Migration from JSONB Column (Existing Notes)
If you previously stored notes in a JSONB column in the initiatives table:

1. **First, create the notes table:**
   - Run the SQL from `supabase-notes-schema.sql`

2. **Then, migrate existing data:**
   - Run the SQL from `supabase-migrate-notes-to-table.sql`
   - This script will automatically extract notes from the initiatives table and insert them into the new notes table
   - After confirming the migration was successful, you can uncomment the last line to drop the old notes column

## Database Schema

### Notes Table Structure
```sql
CREATE TABLE notes (
    id BIGINT PRIMARY KEY,
    initiative_id BIGINT NOT NULL,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_notes_initiative_id`: For efficient querying of notes by initiative
- `idx_notes_created_at`: For ordering notes by creation date

### Foreign Key (Optional)
The notes table can have a foreign key constraint to the initiatives table with CASCADE delete, ensuring notes are automatically deleted when an initiative is deleted.

## Verifying the Setup

### Check the Table Exists
Run this query to verify the `notes` table was created:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notes'
ORDER BY ordinal_position;
```

Expected output:
```
table_name | column_name    | data_type
-----------|----------------|--------------------
notes      | id             | bigint
notes      | initiative_id  | bigint
notes      | text           | text
notes      | author         | text
notes      | created_at     | timestamp with time zone
notes      | updated_at     | timestamp with time zone
```

### Test Adding a Note
1. Open the Portfolio Tracker application
2. Create or edit an initiative with "At Risk" status (notes section only shows for at-risk initiatives)
3. Add a note in the "Notes & Comments" section
4. Reload the page to verify the note persists
5. Check the database to see the stored note:

```sql
SELECT n.id, n.initiative_id, i.name, n.text, n.author, n.created_at
FROM notes n
JOIN initiatives i ON n.initiative_id = i.id
ORDER BY n.created_at DESC
LIMIT 10;
```

## Benefits of Separate Notes Table

### Performance
- Individual notes can be queried, updated, or deleted without loading the entire initiative
- Better indexing capabilities
- Smaller initiative table size

### Flexibility
- Easier to add features like editing individual notes
- Can add additional fields (e.g., `edited_at`, `is_deleted`, `attachments`)
- Better support for features like note search, filtering, or analytics

### Data Integrity
- Foreign key constraints ensure referential integrity
- Cascade delete automatically cleans up notes when initiatives are deleted
- Individual note timestamps are more accurate

## Troubleshooting

### Notes not persisting after page reload
1. Check browser console for errors
2. Verify the Supabase connection is working (check the status banner)
3. Verify the `notes` table exists (run the verification query above)
4. Query the database directly to see if notes are being saved:
   ```sql
   SELECT * FROM notes WHERE initiative_id = <your-initiative-id>;
   ```
5. Check RLS policies if you have authentication enabled

### "relation 'notes' does not exist" error
This means the notes table hasn't been created. Run the SQL from `supabase-notes-schema.sql`.

### Notes from JSONB column not migrated
If you had existing notes in a JSONB column:
1. Verify the migration script ran successfully
2. Check for errors in the Supabase logs
3. Manually verify some notes were migrated:
   ```sql
   SELECT COUNT(*) FROM notes;
   ```
4. Compare with the count from the old column (if it still exists)

### Foreign key constraint violations
If you enabled the foreign key constraint and get violations:
1. Ensure the initiatives table exists before creating notes
2. Ensure initiative_id values in notes match existing initiative IDs
3. Check for orphaned notes:
   ```sql
   SELECT n.* FROM notes n
   LEFT JOIN initiatives i ON n.initiative_id = i.id
   WHERE i.id IS NULL;
   ```

## Advanced: Custom Policies

### User-based Access Control
If you have user authentication, you can restrict note access:

```sql
-- Drop the permissive policy
DROP POLICY "Allow all operations on notes" ON notes;

-- Users can only see notes for initiatives they own
CREATE POLICY "Users can view notes for their initiatives" ON notes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM initiatives 
            WHERE initiatives.id = notes.initiative_id 
            AND initiatives.owner = auth.email()
        )
    );

-- Users can only add notes to their own initiatives
CREATE POLICY "Users can add notes to their initiatives" ON notes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM initiatives 
            WHERE initiatives.id = notes.initiative_id 
            AND initiatives.owner = auth.email()
        )
    );
```

## IndexedDB Fallback
If Supabase is not configured or unavailable, the app automatically falls back to IndexedDB for local storage. Notes will still be persisted locally as part of the initiative object, but won't sync across devices.
