# Snapshot Feature Update - Testing Guide

## Overview
This document describes the changes made to the snapshots feature and how to test them.

## What Changed

### Previous Behavior
- Snapshots captured **ALL** initiatives regardless of any filters applied
- User could filter the dashboard or timeline, but snapshots would always include everything

### New Behavior
- Snapshots now capture **ONLY the initiatives visible** in the current view based on active filters
- **Dashboard view**: Respects status filters (all/active/completed/planned/risk) and category filters
- **Timeline view**: Respects timeline filters (name, key initiatives only, owner, status, target date)
- **Snapshots view**: Captures all initiatives (no filters)
- **Automatic weekly snapshots**: Continue to capture all initiatives (backward compatibility)

## Technical Implementation

### Changes Made
1. **Added `activeView` to `appState`**: Tracks whether user is on 'current' (dashboard), 'timeline', or 'snapshots' view
2. **Updated `switchView()`**: Sets `activeView` when switching between views
3. **Created `getFilteredInitiativesForCurrentView()`**: Returns filtered initiatives based on the active view and its filters
4. **Updated `takeSnapshot()`**: Uses filtered initiatives from current view instead of all initiatives
5. **Updated `createSnapshotInDB()` and `createSnapshotInSupabase()`**: Accept optional `initiatives` parameter for filtered data

### Backward Compatibility
- Automatic weekly snapshots continue to capture all initiatives
- Both storage backends supported (Supabase and IndexedDB)
- No breaking changes to existing snapshot data structure

## How to Test

### Test 1: Dashboard Status Filter
1. Open the portfolio tracker
2. Click on the "Active" metric card to filter by active initiatives
3. Verify only active initiatives are shown in the list
4. Switch to the "History" (Snapshots) view
5. Add a note: "Active initiatives snapshot"
6. Click "Take Snapshot"
7. Click on the newly created snapshot
8. **Expected**: Snapshot should only contain active initiatives

### Test 2: Dashboard Category Filter
1. Switch back to Dashboard view
2. Click on a category filter (e.g., "Tech")
3. Verify only initiatives in that category are shown
4. Switch to Snapshots view
5. Add a note: "Tech category snapshot"
6. Click "Take Snapshot"
7. View the snapshot
8. **Expected**: Snapshot should only contain initiatives in the selected category

### Test 3: Timeline Name Filter
1. Switch to Timeline view
2. Enter a search term in the "Name" filter (e.g., "Project")
3. Verify only matching initiatives are shown in timeline
4. Switch to Snapshots view
5. Add a note: "Filtered by name"
6. Click "Take Snapshot"
7. View the snapshot
8. **Expected**: Snapshot should only contain initiatives matching the name filter

### Test 4: Timeline Key Initiatives Filter
1. Switch to Timeline view
2. Check the "Key initiatives only" checkbox
3. Verify only key initiatives are shown
4. Switch to Snapshots view
5. Add a note: "Key initiatives only"
6. Click "Take Snapshot"
7. View the snapshot
8. **Expected**: Snapshot should only contain key initiatives

### Test 5: Timeline Status Filter
1. Switch to Timeline view
2. Clear all filters (Reset Filters button)
3. Check only "Active" and "Risk" status checkboxes
4. Verify only active and risk initiatives are shown
5. Switch to Snapshots view
6. Add a note: "Active and Risk"
7. Click "Take Snapshot"
8. View the snapshot
9. **Expected**: Snapshot should only contain active and risk initiatives

### Test 6: Multiple Filters Combined
1. Switch to Dashboard view
2. Click "Active" status filter
3. Click a category filter
4. Switch to Snapshots view
5. Take a snapshot
6. **Expected**: Snapshot should contain only initiatives that match BOTH filters

### Test 7: No Filters (All Initiatives)
1. Switch to Dashboard view
2. Ensure "All" is selected for both status and category
3. Switch to Snapshots view
4. Add a note: "All initiatives"
5. Click "Take Snapshot"
6. View the snapshot
7. **Expected**: Snapshot should contain all initiatives

### Test 8: Weekly Automatic Snapshot
1. Check browser console for log messages about automatic snapshots
2. If a weekly snapshot is created, verify it contains all initiatives
3. **Expected**: Automatic weekly snapshots should always capture all initiatives regardless of filters

## Verification Checklist

- [ ] Dashboard status filter (all/active/completed/planned/risk) affects snapshot content
- [ ] Dashboard category filter affects snapshot content
- [ ] Timeline name filter affects snapshot content
- [ ] Timeline key initiatives filter affects snapshot content
- [ ] Timeline owner filter affects snapshot content
- [ ] Timeline status filter (checkboxes) affects snapshot content
- [ ] Timeline target date filter affects snapshot content
- [ ] Combining multiple filters works correctly
- [ ] Taking snapshot from Snapshots view captures all initiatives
- [ ] Automatic weekly snapshots capture all initiatives
- [ ] Snapshot data is correctly stored in the database
- [ ] Snapshot preview shows the correct filtered data
- [ ] No JavaScript errors in console during snapshot creation
- [ ] Both Supabase and IndexedDB storage modes work correctly

## Troubleshooting

### Issue: Snapshot contains all initiatives despite filters
**Solution**: 
- Ensure you're on the Dashboard or Timeline view when taking the snapshot
- Verify filters are actually applied before switching to Snapshots view
- Check browser console for errors

### Issue: Snapshot is empty
**Solution**:
- Check if filters are too restrictive
- Verify initiatives exist in the system
- Check browser console for errors

### Issue: activeView not set correctly
**Solution**:
- Verify `switchView()` is being called when changing views
- Check browser console: `console.log(appState.activeView)` after switching views

## Code References

### Key Functions
- `getFilteredInitiativesForCurrentView()` - Lines ~3114-3144
- `takeSnapshot()` - Lines ~3146-3166
- `createSnapshotInDB()` - Lines ~2385-2416
- `createSnapshotInSupabase()` - Lines ~1955-1978
- `switchView()` - Lines ~3200-3212

### State Management
- `appState.activeView` - Line ~2519
- `appState.filterStatus` - Line ~2497
- `appState.filterCategory` - Line ~2498
- `appState.timelineFilters` - Lines ~2501-2507

## Success Criteria
✅ Snapshots capture only filtered initiatives from current view
✅ Weekly automatic snapshots continue to capture all initiatives
✅ No breaking changes to existing functionality
✅ No data loss or corruption
✅ Clear and intuitive behavior for end users
