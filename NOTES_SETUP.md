# Notes Feature Setup for Supabase

## Overview
This document explains how to ensure the `notes` field is properly configured in the Supabase `initiatives` table.

## Prerequisites
- A Supabase project with the Portfolio Tracker database
- Access to the Supabase SQL Editor
- An existing `initiatives` table (or you can create a new one)

## Setup Instructions

### Option 1: For Existing Initiatives Table
If you already have an `initiatives` table, run the migration script to add the `notes` column:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor section
3. Click "New Query"
4. Copy and paste the SQL from `supabase-add-notes-column.sql`
5. Run the query

This will add a `notes` column (JSONB type) to your existing table without affecting existing data.

### Option 2: For New Initiatives Table
If you're setting up the initiatives table for the first time:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor section
3. Click "New Query"
4. Copy and paste the SQL from `supabase-initiatives-schema.sql`
5. Run the query

This creates the complete `initiatives` table with all required columns including `notes`.

## Verifying the Setup

### Check the Column Exists
Run this query to verify the `notes` column was created:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'initiatives' AND column_name = 'notes';
```

Expected output:
```
column_name | data_type
------------|----------
notes       | jsonb
```

### Test Adding a Note
1. Open the Portfolio Tracker application
2. Create or edit an initiative with "At Risk" status (notes section only shows for at-risk initiatives)
3. Add a note in the "Notes & Comments" section
4. Reload the page to verify the note persists
5. Check the database to see the stored note:

```sql
SELECT id, name, notes 
FROM initiatives 
WHERE notes IS NOT NULL AND jsonb_array_length(notes) > 0;
```

## Notes Data Structure

Notes are stored as a JSONB array. Each note object contains:
- `id`: Unique identifier (timestamp)
- `text`: The note content
- `author`: The person who created the note (from initiative owner)
- `date`: ISO timestamp when the note was created

Example:
```json
[
  {
    "id": 1738583640000,
    "text": "This is a test note to verify persistence.",
    "author": "John Doe",
    "date": "2026-02-03T10:00:40.000Z"
  }
]
```

## Troubleshooting

### Notes not persisting after page reload
1. Check browser console for errors
2. Verify the Supabase connection is working (check the status banner)
3. Verify the `notes` column exists in the database (run the verification query above)
4. Query the database directly to see if notes are being saved:
   ```sql
   SELECT id, name, notes FROM initiatives WHERE id = <your-initiative-id>;
   ```
5. Check RLS policies if you have authentication enabled

### "column 'notes' does not exist" error
This means the migration script hasn't been run. Follow "Option 1" above to add the column.

### Notes array is null instead of empty array
The default value should be `'[]'::jsonb`. If you see NULL values, update them:
```sql
UPDATE initiatives SET notes = '[]'::jsonb WHERE notes IS NULL;
```

## IndexedDB Fallback
If Supabase is not configured or unavailable, the app automatically falls back to IndexedDB for local storage. Notes will still be persisted locally, but won't sync across devices.
