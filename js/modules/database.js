/**
 * Database Module
 * Handles all database operations (Supabase + IndexedDB)
 */

import { SUPABASE_CONFIG, CONNECTION_STATUS } from './config.js';

// Database configuration
const DB_NAME = 'InitiativeTrackerDB';
const DB_VERSION = 2;

// Module state
let supabaseClient = null;
let useSupabase = false;
let connectionStatus = CONNECTION_STATUS.INITIALIZING;
let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>} Database instance
 */
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            console.log('✅ IndexedDB initialized');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            if (!database.objectStoreNames.contains('initiatives')) {
                const initiativeStore = database.createObjectStore('initiatives', { keyPath: 'id' });
                initiativeStore.createIndex('status', 'status', { unique: false });
                initiativeStore.createIndex('owner', 'owner', { unique: false });
            }
            
            if (!database.objectStoreNames.contains('snapshots')) {
                database.createObjectStore('snapshots', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!database.objectStoreNames.contains('activities')) {
                const activityStore = database.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
                activityStore.createIndex('timestamp', 'timestamp', { unique: false });
                activityStore.createIndex('type', 'type', { unique: false });
            }
            
            console.log('✅ Database schema created');
        };
    });
}

/**
 * Initialize Supabase client
 * @returns {Promise<boolean>} True if connected, false if using local storage
 */
async function initializeSupabase() {
    console.log('🚀 Initializing Database...');
    
    // Check if Supabase is configured
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.warn('⚠️ Supabase credentials not configured');
        useSupabase = false;
        connectionStatus = CONNECTION_STATUS.LOCAL;
        await initDB();
        return false;
    }
    
    // Try to initialize Supabase
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        // Test the connection
        const { error } = await supabaseClient
            .from('initiatives')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        useSupabase = true;
        connectionStatus = CONNECTION_STATUS.CONNECTED;
        console.log('✅ Connected to Supabase');
        return true;
        
    } catch (error) {
        console.error('Supabase connection failed:', error);
        connectionStatus = CONNECTION_STATUS.ERROR;
        useSupabase = false;
        await initDB();
        return false;
    }
}

/**
 * Health check for Supabase connection
 * @returns {Promise<boolean>} True if healthy
 */
async function performHealthCheck() {
    if (!useSupabase) return false;
    
    try {
        const { error } = await supabaseClient
            .from('initiatives')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        if (connectionStatus !== CONNECTION_STATUS.CONNECTED) {
            connectionStatus = CONNECTION_STATUS.CONNECTED;
        }
        return true;
        
    } catch (error) {
        console.error('Health check failed:', error);
        connectionStatus = CONNECTION_STATUS.ERROR;
        return false;
    }
}

// ====================================
// INITIATIVE CRUD OPERATIONS
// ====================================

/**
 * Transform database format to app format
 */
function transformToAppFormat(dbItem) {
    return {
        id: dbItem.id,
        name: dbItem.name,
        owner: dbItem.owner,
        status: dbItem.status,
        startDate: dbItem.start_date,
        targetDate: dbItem.target_date,
        categories: dbItem.categories || [],
        tags: dbItem.tags || [],
        phases: dbItem.phases || [],
        keyInitiative: dbItem.key_initiative || 'No',
        created_at: dbItem.created_at,
        updated_at: dbItem.updated_at
    };
}

/**
 * Transform app format to database format
 */
function transformToDbFormat(initiative) {
    return {
        id: initiative.id,
        name: initiative.name,
        owner: initiative.owner,
        status: initiative.status,
        start_date: initiative.startDate,
        target_date: initiative.targetDate,
        categories: initiative.categories || [],
        tags: initiative.tags || [],
        phases: initiative.phases || [],
        key_initiative: initiative.keyInitiative || 'No',
        updated_at: new Date().toISOString()
    };
}

/**
 * Get all initiatives
 * @returns {Promise<Array>} Array of initiatives
 */
async function getAllInitiatives() {
    if (useSupabase) {
        const { data, error } = await supabaseClient
            .from('initiatives')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data.map(transformToAppFormat);
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['initiatives'], 'readonly');
        const store = transaction.objectStore('initiatives');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get initiative by ID
 * @param {string} id - Initiative ID
 * @returns {Promise<Object|null>} Initiative or null if not found
 */
async function getInitiativeById(id) {
    if (useSupabase) {
        const { data, error } = await supabaseClient
            .from('initiatives')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return transformToAppFormat(data);
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['initiatives'], 'readonly');
        const store = transaction.objectStore('initiatives');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Save initiative (create or update)
 * @param {Object} initiative - Initiative object
 * @returns {Promise<Object>} Saved initiative
 */
async function saveInitiative(initiative) {
    if (useSupabase) {
        const dbFormat = transformToDbFormat(initiative);
        const { data, error } = await supabaseClient
            .from('initiatives')
            .upsert(dbFormat)
            .select()
            .single();
        
        if (error) throw error;
        console.log('💾 Saved to Supabase:', initiative.id, initiative.name);
        return initiative;
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['initiatives'], 'readwrite');
        const store = transaction.objectStore('initiatives');
        
        if (!initiative.created_at) {
            initiative.created_at = new Date().toISOString();
        }
        initiative.updated_at = new Date().toISOString();
        
        const request = store.put(initiative);
        request.onsuccess = () => {
            console.log('💾 Saved initiative to DB:', initiative.id, initiative.name);
            resolve(initiative);
        };
        request.onerror = () => {
            console.error('❌ Failed to save initiative:', initiative.id, request.error);
            reject(request.error);
        };
    });
}

/**
 * Delete initiative
 * @param {string} id - Initiative ID
 * @returns {Promise<void>}
 */
async function deleteInitiative(id) {
    if (useSupabase) {
        const { error } = await supabaseClient
            .from('initiatives')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return;
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['initiatives'], 'readwrite');
        const store = transaction.objectStore('initiatives');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ====================================
// SNAPSHOT OPERATIONS
// ====================================

/**
 * Get all snapshots
 * @returns {Promise<Array>} Array of snapshots
 */
async function getAllSnapshots() {
    if (useSupabase) {
        const { data, error } = await supabaseClient
            .from('snapshots')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(item => ({
            id: item.id.toString(),
            note: item.note,
            data: JSON.stringify(item.data),
            created_at: item.created_at
        }));
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['snapshots'], 'readonly');
        const store = transaction.objectStore('snapshots');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Create snapshot
 * @param {string} note - Snapshot note
 * @param {Array} initiatives - Initiatives data (optional, will fetch if not provided)
 * @returns {Promise<Object>} Created snapshot
 */
async function createSnapshot(note, initiatives = null) {
    if (!initiatives) {
        initiatives = await getAllInitiatives();
    }
    
    if (useSupabase) {
        const { data, error } = await supabaseClient
            .from('snapshots')
            .insert({
                note: note || '',
                data: initiatives
            })
            .select()
            .single();
        
        if (error) throw error;
        
        return {
            id: data.id.toString(),
            note: data.note,
            data: JSON.stringify(data.data),
            created_at: data.created_at
        };
    }
    
    return new Promise((resolve, reject) => {
        const snapshot = {
            note: note || '',
            data: JSON.stringify(initiatives),
            created_at: new Date().toISOString()
        };
        
        const transaction = db.transaction(['snapshots'], 'readwrite');
        const store = transaction.objectStore('snapshots');
        const request = store.add(snapshot);
        
        request.onsuccess = () => {
            snapshot.id = request.result;
            resolve(snapshot);
        };
        request.onerror = () => reject(request.error);
    });
}

// ====================================
// ACTIVITY OPERATIONS
// ====================================

/**
 * Get all activities (latest 10)
 * @returns {Promise<Array>} Array of activities
 */
async function getAllActivities() {
    if (useSupabase) {
        const { data, error } = await supabaseClient
            .from('activities')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            type: item.type,
            icon: item.icon,
            text: item.text,
            meta: item.meta,
            timestamp: item.timestamp,
            initiativeId: item.initiative_id,
            initiativeName: item.initiative_name
        }));
    }
    
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve([]);
            return;
        }
        
        const transaction = db.transaction(['activities'], 'readonly');
        const store = transaction.objectStore('activities');
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        
        const activities = [];
        let count = 0;
        
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor && count < 10) {
                activities.push(cursor.value);
                count++;
                cursor.continue();
            } else {
                resolve(activities);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Save activity
 * @param {Object} activity - Activity object
 * @returns {Promise<Object>} Saved activity
 */
async function saveActivity(activity) {
    if (useSupabase) {
        const dbFormat = {
            type: activity.type,
            icon: activity.icon,
            text: activity.text,
            meta: activity.meta,
            timestamp: activity.timestamp,
            initiative_id: activity.initiativeId,
            initiative_name: activity.initiativeName
        };
        
        const { data, error } = await supabaseClient
            .from('activities')
            .insert(dbFormat)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('💾 Activity saved to Supabase:', activity.type);
        return {
            id: data.id,
            type: data.type,
            icon: data.icon,
            text: data.text,
            meta: data.meta,
            timestamp: data.timestamp,
            initiativeId: data.initiative_id,
            initiativeName: data.initiative_name
        };
    }
    
    return new Promise((resolve, reject) => {
        if (!db) {
            console.warn('⚠️ Database not initialized, skipping activity save');
            resolve(activity);
            return;
        }
        
        const transaction = db.transaction(['activities'], 'readwrite');
        const store = transaction.objectStore('activities');
        
        if (!activity.timestamp) {
            activity.timestamp = new Date().toISOString();
        }
        
        const request = store.add(activity);
        request.onsuccess = () => {
            activity.id = request.result;
            console.log('💾 Activity saved to DB:', activity.type);
            resolve(activity);
        };
        request.onerror = () => {
            console.error('❌ Failed to save activity:', request.error);
            reject(request.error);
        };
    });
}

// ====================================
// MIGRATION & UTILITY
// ====================================

/**
 * Migrate data from IndexedDB to Supabase
 * @returns {Promise<Object>} Migration result
 */
async function migrateToSupabase() {
    if (!useSupabase) {
        throw new Error('Supabase not configured');
    }
    
    if (!db) await initDB();
    
    // Get all local data
    const localInitiatives = await getAllInitiatives();
    const localSnapshots = await getAllSnapshots();
    
    console.log(`Migrating ${localInitiatives.length} initiatives...`);
    
    // Migrate initiatives
    for (const initiative of localInitiatives) {
        await saveInitiative(initiative);
    }
    
    console.log(`Migrating ${localSnapshots.length} snapshots...`);
    
    // Migrate snapshots
    for (const snapshot of localSnapshots) {
        await supabaseClient.from('snapshots').insert({
            note: snapshot.note,
            data: JSON.parse(snapshot.data)
        });
    }
    
    console.log('✅ Migration complete!');
    return {
        initiatives: localInitiatives.length,
        snapshots: localSnapshots.length
    };
}

/**
 * Get connection status
 * @returns {string} Current connection status
 */
function getConnectionStatus() {
    return connectionStatus;
}

/**
 * Check if using Supabase
 * @returns {boolean} True if using Supabase
 */
function isUsingSupabase() {
    return useSupabase;
}

// Export all functions
export {
    initializeSupabase,
    performHealthCheck,
    getAllInitiatives,
    getInitiativeById,
    saveInitiative,
    deleteInitiative,
    getAllSnapshots,
    createSnapshot,
    getAllActivities,
    saveActivity,
    migrateToSupabase,
    getConnectionStatus,
    isUsingSupabase
};
