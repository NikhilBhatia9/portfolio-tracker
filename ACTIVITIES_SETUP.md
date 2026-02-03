# Activities Table Setup for Supabase

## Overview
This document explains how to set up the `activities` table in Supabase to enable activity tracking and persistence in the Portfolio Tracker.

## Prerequisites
- A Supabase project with the Portfolio Tracker database
- Access to the Supabase SQL Editor

## Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor section
3. Click "New Query"

### Step 2: Create the Activities Table
Copy and paste the SQL from `supabase-activities-schema.sql` into the SQL Editor and run it.

The schema creates:
- An `activities` table with the following columns:
  - `id`: Auto-incrementing primary key
  - `type`: Activity type (e.g., 'completed', 'updated', 'note_added')
  - `icon`: Emoji icon for the activity
  - `text`: Activity description
  - `meta`: Metadata (typically the user/owner name)
  - `timestamp`: When the activity occurred
  - `initiative_id`: Reference to the initiative
  - `initiative_name`: Name of the initiative
  - `created_at`: Table audit timestamp

- Indexes for performance:
  - `idx_activities_timestamp`: For ordering by time
  - `idx_activities_type`: For filtering by activity type
  - `idx_activities_initiative_id`: For filtering by initiative

- Row Level Security (RLS) policies:
  - Basic "allow all" policy for demo/public use
  - Can be customized based on your authentication setup

### Step 3: Verify the Table
Run this query to verify the table was created:
```sql
SELECT * FROM activities LIMIT 1;
```

### Step 4: Test Activity Logging
1. Open the Portfolio Tracker application
2. Mark an initiative as completed or update an initiative
3. Check that the activity appears in the Recent Activity section
4. Reload the page to verify persistence
5. Query the database to see the stored activity:
```sql
SELECT * FROM activities ORDER BY timestamp DESC LIMIT 10;
```

## Schema Details

### Activity Types
The following activity types are currently logged:
- `completed`: When an initiative status changes to "completed"
- `updated`: When an initiative is modified
- `note_added`: When a note is added to an initiative

### Meta Field
The `meta` field stores the owner/author name. The relative time (e.g., "2 hours ago") is computed at display time, not stored in the database.

## Customization

### Adding Authentication
If you have user authentication, update the RLS policies:

```sql
-- Drop the permissive policy
DROP POLICY "Allow all operations on activities" ON activities;

-- Create user-specific policies
CREATE POLICY "Users can view all activities" ON activities
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert activities" ON activities
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
```

### Limiting Activity History
To automatically delete old activities, you can create a function:

```sql
CREATE OR REPLACE FUNCTION delete_old_activities()
RETURNS void AS $$
BEGIN
    DELETE FROM activities
    WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule it to run daily (requires pg_cron extension)
SELECT cron.schedule(
    'delete-old-activities',
    '0 0 * * *',
    'SELECT delete_old_activities();'
);
```

## Troubleshooting

### Activities not appearing after page reload
1. Check browser console for errors
2. Verify the Supabase connection is working (check the status banner)
3. Query the database directly to see if activities are being saved
4. Check RLS policies if you have authentication enabled

### Activities showing "Just now" even for old activities
This should be fixed in the latest version. The relative time is now computed at display time. If you're still seeing this issue, clear your browser cache and reload.

## IndexedDB Fallback
If Supabase is not configured or unavailable, the app automatically falls back to IndexedDB for local storage. Activities will still be persisted locally, but won't sync across devices.
