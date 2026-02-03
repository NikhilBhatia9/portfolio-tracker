/**
 * Configuration Module
 * Contains all application configuration and constants
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
    url: 'https://kkqysoquhqoiwqoyphwp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXlzb3F1aHFvaXdxb3lwaHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjgzMjIsImV4cCI6MjA4NTU0NDMyMn0.YJl8sVng8S6TruNf-46DJiOV7U06MuLicPCaQw7LvPc'
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
export const EMAIL_SCHEDULER_URL = 'http://localhost:3001';
