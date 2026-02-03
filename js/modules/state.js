/**
 * State Management Module
 * Handles application state and local storage persistence
 */

import { STORAGE_KEYS } from './config.js';
import { getAllInitiatives, getAllActivities } from './database.js';

// Application state
const appState = {
    initiatives: [],
    activities: [],
    snapshots: [],
    activeView: 'dashboard',
    filters: {
        status: 'all',
        category: 'all',
        search: ''
    },
    selectedCategories: [],
    selectedTags: []
};

/**
 * Initialize application state
 * @returns {Promise<void>}
 */
async function initializeState() {
    try {
        // Load saved view preference
        const savedView = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
        if (savedView) {
            appState.activeView = savedView;
        }
        
        // Load data from database
        await loadData();
        
        console.log('✅ Application state initialized');
    } catch (error) {
        console.error('Failed to initialize state:', error);
        throw error;
    }
}

/**
 * Load all data from database
 * @returns {Promise<void>}
 */
async function loadData() {
    try {
        appState.initiatives = await getAllInitiatives();
        appState.activities = await getAllActivities();
        console.log(`📊 Loaded ${appState.initiatives.length} initiatives`);
    } catch (error) {
        console.error('Failed to load data:', error);
        throw error;
    }
}

/**
 * Get all initiatives from state
 * @returns {Array} Array of initiatives
 */
function getInitiatives() {
    return appState.initiatives;
}

/**
 * Get initiative by ID from state
 * @param {string} id - Initiative ID
 * @returns {Object|undefined} Initiative or undefined
 */
function getInitiativeById(id) {
    return appState.initiatives.find(i => i.id === id);
}

/**
 * Add or update initiative in state
 * @param {Object} initiative - Initiative object
 */
function updateInitiativeInState(initiative) {
    const index = appState.initiatives.findIndex(i => i.id === initiative.id);
    if (index !== -1) {
        appState.initiatives[index] = initiative;
    } else {
        appState.initiatives.push(initiative);
    }
}

/**
 * Remove initiative from state
 * @param {string} id - Initiative ID
 */
function removeInitiativeFromState(id) {
    appState.initiatives = appState.initiatives.filter(i => i.id !== id);
}

/**
 * Get all activities from state
 * @returns {Array} Array of activities
 */
function getActivities() {
    return appState.activities;
}

/**
 * Add activity to state
 * @param {Object} activity - Activity object
 */
function addActivityToState(activity) {
    appState.activities.unshift(activity);
    // Keep only the latest 10 activities
    if (appState.activities.length > 10) {
        appState.activities = appState.activities.slice(0, 10);
    }
}

/**
 * Get active view
 * @returns {string} Active view name
 */
function getActiveView() {
    return appState.activeView;
}

/**
 * Set active view
 * @param {string} view - View name
 */
function setActiveView(view) {
    appState.activeView = view;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view);
}

/**
 * Get filters
 * @returns {Object} Current filters
 */
function getFilters() {
    return { ...appState.filters };
}

/**
 * Update filters
 * @param {Object} filters - Filter updates
 */
function updateFilters(filters) {
    appState.filters = { ...appState.filters, ...filters };
}

/**
 * Get selected categories
 * @returns {Array} Selected categories
 */
function getSelectedCategories() {
    return appState.selectedCategories;
}

/**
 * Set selected categories
 * @param {Array} categories - Categories array
 */
function setSelectedCategories(categories) {
    appState.selectedCategories = categories;
}

/**
 * Get selected tags
 * @returns {Array} Selected tags
 */
function getSelectedTags() {
    return appState.selectedTags;
}

/**
 * Set selected tags
 * @param {Array} tags - Tags array
 */
function setSelectedTags(tags) {
    appState.selectedTags = tags;
}

/**
 * Get filtered initiatives based on current filters
 * @returns {Array} Filtered initiatives
 */
function getFilteredInitiatives() {
    let filtered = [...appState.initiatives];
    
    // Apply status filter
    if (appState.filters.status !== 'all') {
        filtered = filtered.filter(i => i.status === appState.filters.status);
    }
    
    // Apply category filter
    if (appState.filters.category !== 'all') {
        filtered = filtered.filter(i => 
            i.categories && i.categories.includes(appState.filters.category)
        );
    }
    
    // Apply search filter
    if (appState.filters.search) {
        const search = appState.filters.search.toLowerCase();
        filtered = filtered.filter(i => 
            i.name.toLowerCase().includes(search) ||
            (i.owner && i.owner.toLowerCase().includes(search))
        );
    }
    
    return filtered;
}

/**
 * Reset state to initial values
 */
function resetState() {
    appState.initiatives = [];
    appState.activities = [];
    appState.snapshots = [];
    appState.filters = {
        status: 'all',
        category: 'all',
        search: ''
    };
    appState.selectedCategories = [];
    appState.selectedTags = [];
}

// Export all functions
export {
    initializeState,
    loadData,
    getInitiatives,
    getInitiativeById,
    updateInitiativeInState,
    removeInitiativeFromState,
    getActivities,
    addActivityToState,
    getActiveView,
    setActiveView,
    getFilters,
    updateFilters,
    getSelectedCategories,
    setSelectedCategories,
    getSelectedTags,
    setSelectedTags,
    getFilteredInitiatives,
    resetState
};
