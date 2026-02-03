/**
 * Configuration Module - Example Template
 * Copy this file to config.js and fill in your actual values
 * DO NOT commit config.js with real credentials to version control
 */

// Supabase Configuration
// Get these from: Supabase Dashboard → Settings → API
export const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL_HERE',
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
};

// Timeline Configuration
export const TIMELINE_CONFIG = {
    laneHeight: 24,
    barHeight: 20,
    laneGap: 4,
    laneSeparator: 'rgba(100, 116, 139, 0.15)'
};

// Status Options
export const STATUS_OPTIONS = ['Active', 'Risk', 'Planned', 'Completed'];

// Status Icons
export const STATUS_ICONS = {
    'Active': '✓',
    'Risk': '⚠',
    'Planned': '📋',
    'Completed': '✅'
};

// Connection Status Types
export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    LOCAL: 'local',
    ERROR: 'error',
    INITIALIZING: 'initializing'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    APP_STATE: 'portfolioTrackerState',
    ACTIVE_VIEW: 'activeView',
    INITIATIVES: 'initiatives'
};

// Email Scheduler Configuration
// Change these if your services run on different ports
export const EMAIL_SCHEDULER_URL = 'http://localhost:3001';

// JIRA Configuration
// Change these based on your environment
export const JIRA_PROXY_URL = 'http://localhost:8080/proxy';

// Date Configuration
export const DEFAULT_INITIATIVE_DURATION_DAYS = 30;
