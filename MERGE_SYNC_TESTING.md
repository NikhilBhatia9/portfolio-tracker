# Testing Guide: JIRA Sync Merge Functionality

## Overview
This document provides a comprehensive guide to test the new merge functionality for JIRA sync that preserves user-modified data in Supabase.

## What Changed
Previously, syncing from JIRA would **overwrite** all initiative data, wiping out user-added:
- Phases (project milestones)
- Tags
- Manually added categories

Now, the sync **merges** JIRA data with existing data:
- ✅ Preserves: phases, tags, manually added categories, manually edited dates (startDate, targetDate)
- ✅ Updates from JIRA: name, owner, status, keyInitiative
- ✅ Merges categories: combines JIRA categories with existing ones (no duplicates)

## Prerequisites
1. Running proxy server on port 8080 (for JIRA sync)
2. Valid JIRA credentials (domain, email, API token)
3. Supabase configured (or IndexedDB as fallback)

## Test Scenarios

### Scenario 1: New Initiative Sync
**Objective:** Verify new initiatives from JIRA are created correctly

**Steps:**
1. Clear all data (Settings > Clear Local Data)
2. Perform JIRA sync
3. Verify initiatives appear in the UI

**Expected Result:**
- All JIRA initiatives are created
- Console shows: `✨ Creating initiative: [ISSUE-KEY]`
- No phases, tags initially (as expected for new items)

---

### Scenario 2: Preserve Phases on Sync
**Objective:** Verify user-created phases are preserved during sync

**Steps:**
1. Perform initial JIRA sync
2. Select an initiative and add phases:
   - Click the initiative card
   - Add phase: "Planning" (dates: Jan 1 - Jan 15)
   - Add phase: "Development" (dates: Jan 16 - Feb 28)
   - Save
3. Perform JIRA sync again
4. Open the same initiative

**Expected Result:**
- Both phases still exist with correct dates
- Console shows: `🔄 Merging initiative: [ISSUE-KEY]`
- Console shows: `preservedPhases: 2`
- Initiative name/owner/status may update from JIRA (expected)

---

### Scenario 3: Preserve Tags on Sync
**Objective:** Verify user-added tags are preserved during sync

**Steps:**
1. Perform initial JIRA sync
2. Select an initiative and add tags:
   - Open initiative details
   - Add tags: "urgent", "customer-facing", "security"
   - Save
3. Perform JIRA sync again
4. Open the same initiative

**Expected Result:**
- All 3 tags still present
- Console shows: `preservedTags: 3`
- Other fields updated from JIRA as expected

---

### Scenario 4: Merge Categories
**Objective:** Verify categories from JIRA are merged with manually added categories

**Steps:**
1. Perform initial JIRA sync
2. Note the categories from JIRA (e.g., "Platform Development & Integration")
3. Manually add a custom category to an initiative:
   - Open initiative
   - Add category: "High Priority"
   - Save
4. Perform JIRA sync again
5. Check the initiative's categories

**Expected Result:**
- Both JIRA category AND custom category present
- Console shows merged categories array
- No duplicate categories
- Example: `mergedCategories: ["Platform Development & Integration", "High Priority"]`

---

### Scenario 5: Updated JIRA Fields
**Objective:** Verify JIRA fields are updated correctly and dates are preserved

**Steps:**
1. Perform initial JIRA sync for an initiative
2. In the portfolio tracker, manually edit the initiative:
   - Change start date (e.g., from auto-generated to a specific date)
   - Change target date (e.g., to extend the timeline)
3. In JIRA, change the initiative:
   - Update status (e.g., from "In Progress" to "Done")
   - Change assignee
   - Modify due date
4. Add a phase and tag in the portfolio tracker
5. Perform JIRA sync again
6. Check the initiative

**Expected Result:**
- Status updated from JIRA ✅
- Owner updated from JIRA ✅
- Start date preserved from manual edit (NOT updated from JIRA) ✅
- Target date preserved from manual edit (NOT updated from JIRA due date) ✅
- Phase preserved ✅
- Tag preserved ✅
- Console shows merge operation with all details

---

### Scenario 6: Preserve Manually Edited Dates on Sync
**Objective:** Verify user-edited start and target dates are preserved during sync

**Steps:**
1. Perform initial JIRA sync to import initiatives
2. Select an initiative and edit its dates:
   - Click the initiative card to open details
   - Change start date to a specific date (e.g., "2026-03-01")
   - Change target date to a specific date (e.g., "2026-06-30")
   - Save the changes
3. Verify dates are saved in the database
4. Perform JIRA sync again
5. Open the same initiative

**Expected Result:**
- Start date remains "2026-03-01" (preserved from manual edit)
- Target date remains "2026-06-30" (preserved from manual edit)
- Other JIRA fields (name, owner, status) may update as expected
- Console shows: `🔄 Merging initiative: [ISSUE-KEY]`
- No date overwriting from JIRA

---

### Scenario 7: Multiple Syncs
**Objective:** Verify data integrity across multiple syncs

**Steps:**
1. Perform initial JIRA sync
2. Add phases to initiative A
3. Sync again
4. Add tags to initiative B
5. Sync again
6. Add categories to initiative C
7. Sync again
8. Check all three initiatives

**Expected Result:**
- Initiative A: phases preserved
- Initiative B: tags preserved
- Initiative C: categories preserved
- All JIRA fields updated correctly
- No data loss across multiple syncs

---

## Console Logs to Monitor

During sync, look for these console messages:

```javascript
// For new initiatives:
✨ Creating initiative: PROJ-123 {
  jiraCategories: ["Platform Dev"],
  existingCategories: undefined,
  mergedCategories: ["Platform Dev"],
  preservedPhases: 0,
  preservedTags: 0
}

// For existing initiatives:
🔄 Merging initiative: PROJ-456 {
  jiraCategories: ["Platform Dev"],
  existingCategories: ["Platform Dev", "Custom Category"],
  mergedCategories: ["Platform Dev", "Custom Category"],
  preservedPhases: 3,
  preservedTags: 2
}
```

## Edge Cases to Test

### Edge Case 1: Initiative Removed from JIRA
**What Happens:** Initiative exists in Supabase but no longer in JIRA query results
**Expected Behavior:** Initiative remains in Supabase (not deleted), simply not updated

### Edge Case 2: Empty Categories
**Setup:** Initiative has no JIRA categories but has manual categories
**Expected Behavior:** Manual categories preserved

### Edge Case 3: Duplicate Categories
**Setup:** JIRA category "Platform Dev" already exists as manual category
**Expected Behavior:** Only one "Platform Dev" in final list (deduplication works)

### Edge Case 4: IndexedDB Mode
**Setup:** Use without Supabase (local IndexedDB)
**Expected Behavior:** Same merge logic applies, data preserved

## Success Criteria

✅ All scenarios pass without data loss
✅ Console logs show correct merge operations
✅ UI displays preserved data after sync
✅ JIRA fields update correctly
✅ No duplicate categories
✅ No errors in browser console
✅ Status message shows: "Merging with existing data and saving..."

## Troubleshooting

**Issue:** "TypeError: Cannot read property 'categories' of null"
**Solution:** Ensure `getInitiativeFromDB()` returns `null` for missing items (not undefined)

**Issue:** Categories duplicated
**Solution:** Check that `new Set()` deduplication is working correctly

**Issue:** Phases/tags lost
**Solution:** Verify merge function preserves these fields from `existingData`

## Code Review Checklist

- [ ] `getInitiativeFromSupabase()` handles missing records (returns null)
- [ ] `getInitiativeFromDB()` routes correctly (Supabase vs IndexedDB)
- [ ] `mergeInitiativeData()` preserves all required fields
- [ ] Category deduplication works (`new Set()`)
- [ ] Console logs provide useful debugging info
- [ ] Error handling in sync loop continues on individual failures
- [ ] `created_at` timestamp preserved for existing initiatives
