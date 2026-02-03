/**
 * JIRA Integration Module
 * Handles syncing initiatives from JIRA
 */

import { getInitiativeById, saveInitiative } from './database.js';
import { JIRA_PROXY_URL, DEFAULT_INITIATIVE_DURATION_DAYS } from './config.js';

// JIRA Configuration keys
const JIRA_STORAGE_KEYS = {
    DOMAIN: 'jira_domain',
    EMAIL: 'jira_email',
    TOKEN: 'jira_token',
    JQL: 'jira_jql'
};

const JIRA_PROXY_URL = 'http://localhost:8080/proxy';
const DEFAULT_JQL = 'project in ("IT Portfolio") and "Technology Squad[Dropdown]" in ("Platform Development & Integration")';

/**
 * Get JIRA credentials from localStorage
 * @returns {Object} JIRA credentials
 */
function getJiraCredentials() {
    return {
        domain: localStorage.getItem(JIRA_STORAGE_KEYS.DOMAIN) || '',
        email: localStorage.getItem(JIRA_STORAGE_KEYS.EMAIL) || '',
        token: localStorage.getItem(JIRA_STORAGE_KEYS.TOKEN) || '',
        jql: localStorage.getItem(JIRA_STORAGE_KEYS.JQL) || DEFAULT_JQL
    };
}

/**
 * Save JIRA credentials to localStorage
 * @param {Object} credentials - JIRA credentials
 */
function saveJiraCredentials(credentials) {
    localStorage.setItem(JIRA_STORAGE_KEYS.DOMAIN, credentials.domain);
    localStorage.setItem(JIRA_STORAGE_KEYS.EMAIL, credentials.email);
    localStorage.setItem(JIRA_STORAGE_KEYS.TOKEN, credentials.token);
    localStorage.setItem(JIRA_STORAGE_KEYS.JQL, credentials.jql);
}

/**
 * Clear JIRA credentials from localStorage
 */
function clearJiraCredentials() {
    Object.values(JIRA_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

/**
 * Fetch data from JIRA via proxy
 * @param {string} targetUrl - Target JIRA API URL
 * @param {string} method - HTTP method
 * @param {Object} credentials - JIRA credentials
 * @param {Object} body - Request body (optional)
 * @returns {Promise<Object>} Response data
 */
async function fetchFromJira(targetUrl, method, credentials, body = null) {
    const headers = {
        'x-target-url': targetUrl,
        'Authorization': 'Basic ' + btoa(`${credentials.email}:${credentials.token}`)
    };
    
    const options = { method, headers };
    
    if (body) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(JIRA_PROXY_URL, options);
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`JIRA API Error (${response.status}): ${errText.substring(0, 150)}`);
    }
    
    return await response.json();
}

/**
 * Resolve JIRA field IDs by name
 * @param {string} domain - JIRA domain
 * @param {Object} credentials - JIRA credentials
 * @returns {Promise<Object>} Field ID mappings
 */
async function resolveJiraFields(domain, credentials) {
    const allFields = await fetchFromJira(
        `https://${domain}/rest/api/3/field`,
        'GET',
        credentials
    );
    
    if (!Array.isArray(allFields)) {
        throw new Error('Invalid JIRA field metadata response');
    }
    
    console.log('📋 Available JIRA fields:', allFields.map(f => f.name));
    
    const keyInitiativeField = allFields.find(f => 
        f.name && f.name.toLowerCase().includes('key initiative')
    );
    const techSquadField = allFields.find(f => 
        f.name && f.name.toLowerCase().includes('technology squad')
    );
    
    return {
        keyInitiativeFieldId: keyInitiativeField ? keyInitiativeField.id : null,
        techSquadFieldId: techSquadField ? techSquadField.id : null
    };
}

/**
 * Fetch issues from JIRA using JQL
 * @param {string} domain - JIRA domain
 * @param {Object} credentials - JIRA credentials
 * @param {string} jql - JQL query
 * @param {Array} fields - Fields to fetch
 * @returns {Promise<Array>} Array of JIRA issues
 */
async function fetchJiraIssues(domain, credentials, jql, fields) {
    const targetUrl = `https://${domain}/rest/api/3/search/jql`;
    const payload = {
        jql: jql,
        fields: fields,
        maxResults: 100
    };
    
    console.log('🔍 Running JQL Query:', jql);
    const data = await fetchFromJira(targetUrl, 'POST', credentials, payload);
    
    console.log('📊 JIRA Response:', {
        total: data.total,
        issueCount: data.issues ? data.issues.length : 0,
        maxResults: data.maxResults
    });
    
    return data.issues || [];
}

/**
 * Fetch key initiative issue keys from JIRA
 * @param {string} domain - JIRA domain
 * @param {Object} credentials - JIRA credentials
 * @returns {Promise<Set>} Set of key initiative issue keys
 */
async function fetchKeyInitiativeKeys(domain, credentials) {
    const keyInitiativeJQL = 'project in ("IT Portfolio") and "Technology Squad[Dropdown]" in ("Platform Development & Integration") and "Key Initiative" is not EMPTY';
    
    try {
        const issues = await fetchJiraIssues(domain, credentials, keyInitiativeJQL, ['key']);
        const keys = new Set(issues.map(issue => issue.key));
        console.log('🔑 Key Initiative IDs:', Array.from(keys));
        return keys;
    } catch (error) {
        console.warn('Failed to fetch key initiatives:', error);
        return new Set();
    }
}

/**
 * Map JIRA status to application status
 * @param {string} jiraStatus - JIRA status name
 * @returns {string} Application status
 */
function mapJiraStatus(jiraStatus) {
    const statusLower = jiraStatus.toLowerCase();
    
    if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('complete')) {
        return 'Completed';
    } else if (statusLower.includes('plan') || statusLower.includes('backlog')) {
        return 'Planned';
    } else if (statusLower.includes('risk') || statusLower.includes('block')) {
        return 'Risk';
    }
    
    return 'Active';
}

/**
 * Map JIRA issue to application initiative format
 * @param {Object} issue - JIRA issue
 * @param {Object} fieldIds - Field ID mappings
 * @param {Set} keyInitiativeKeys - Set of key initiative keys
 * @returns {Object} Initiative object
 */
function mapJiraIssueToInitiative(issue, fieldIds, keyInitiativeKeys) {
    const fields = issue.fields;
    
    // Map status
    const status = fields.status ? mapJiraStatus(fields.status.name) : 'Active';
    
    // Extract dates
    const startDate = fields.created;
    const targetDate = fields.duedate || 
        new Date(new Date(startDate).getTime() + DEFAULT_INITIATIVE_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    
    // Determine if key initiative
    const isKeyInitiative = keyInitiativeKeys.has(issue.key);
    
    // Extract categories from Technology Squad field
    const categories = [];
    if (fieldIds.techSquadFieldId && fields[fieldIds.techSquadFieldId]) {
        const squadValue = fields[fieldIds.techSquadFieldId];
        if (typeof squadValue === 'object' && squadValue.value) {
            categories.push(squadValue.value);
        } else if (typeof squadValue === 'string') {
            categories.push(squadValue);
        }
    }
    
    return {
        id: issue.key,
        name: fields.summary,
        owner: fields.assignee ? fields.assignee.displayName : 'Unassigned',
        keyInitiative: isKeyInitiative ? 'Yes' : 'No',
        status: status,
        startDate: startDate,
        targetDate: targetDate,
        categories: categories,
        tags: [],
        phases: []
    };
}

/**
 * Merge JIRA data with existing database data
 * Preserves user-modified fields while updating JIRA-sourced fields
 * 
 * @param {Object} jiraData - Initiative data from JIRA
 * @param {Object|null} existingData - Existing initiative data from database
 * @returns {Object} Merged initiative object
 */
function mergeInitiativeData(jiraData, existingData) {
    if (!existingData) {
        // New initiative, return JIRA data as-is
        return jiraData;
    }
    
    // Merge categories: combine JIRA categories with existing ones (deduplicate)
    const mergedCategories = [...new Set([
        ...(existingData.categories || []),
        ...(jiraData.categories || [])
    ])];
    
    // Return merged data:
    // - Update from JIRA: id, name, owner, status, keyInitiative
    // - Preserve from existing: phases, tags, dates (if manually edited)
    // - Merge: categories
    return {
        ...jiraData,
        startDate: existingData.startDate || jiraData.startDate,
        targetDate: existingData.targetDate || jiraData.targetDate,
        categories: mergedCategories,
        tags: existingData.tags || [],
        phases: existingData.phases || [],
        created_at: existingData.created_at
    };
}

/**
 * Sync initiatives from JIRA
 * @param {Object} credentials - JIRA credentials
 * @param {Function} onProgress - Progress callback (message, color)
 * @returns {Promise<Object>} Sync result
 */
async function syncFromJira(credentials, onProgress) {
    const domain = credentials.domain.replace('https://', '').replace(/\/.*/, '');
    
    if (!domain || !credentials.email || !credentials.token) {
        throw new Error('Missing JIRA credentials');
    }
    
    // Save credentials
    saveJiraCredentials({ ...credentials, domain });
    
    try {
        // 1. Resolve field IDs
        onProgress('Resolving JIRA fields...', 'muted');
        const fieldIds = await resolveJiraFields(domain, credentials);
        console.log('🔍 Field IDs:', fieldIds);
        
        // 2. Fetch main issues
        onProgress('Fetching JIRA data...', 'muted');
        const fetchFields = ['summary', 'assignee', 'duedate', 'created', 'status', 'project'];
        if (fieldIds.keyInitiativeFieldId) fetchFields.push(fieldIds.keyInitiativeFieldId);
        if (fieldIds.techSquadFieldId) fetchFields.push(fieldIds.techSquadFieldId);
        
        const issues = await fetchJiraIssues(domain, credentials, credentials.jql, fetchFields);
        
        if (issues.length === 0) {
            onProgress(`No issues found matching query: "${credentials.jql}"`, 'warning');
            return { synced: 0, keyInitiatives: 0 };
        }
        
        // 3. Fetch key initiative keys
        onProgress('Identifying key initiatives...', 'muted');
        const keyInitiativeKeys = await fetchKeyInitiativeKeys(domain, credentials);
        
        // 4. Map and merge data
        onProgress('Processing JIRA data...', 'muted');
        const mappedInitiatives = issues.map(issue => 
            mapJiraIssueToInitiative(issue, fieldIds, keyInitiativeKeys)
        );
        
        // 5. Save to database
        onProgress('Saving to database...', 'muted');
        let syncedCount = 0;
        
        for (const jiraItem of mappedInitiatives) {
            try {
                const existingItem = await getInitiativeById(jiraItem.id);
                const mergedItem = mergeInitiativeData(jiraItem, existingItem);
                
                console.log(`${existingItem ? '🔄 Merging' : '✨ Creating'} initiative:`, jiraItem.id);
                
                await saveInitiative(mergedItem);
                syncedCount++;
            } catch (error) {
                console.error(`Failed to save ${jiraItem.id}:`, error);
            }
        }
        
        onProgress(`Success! Synced ${syncedCount} initiatives (${keyInitiativeKeys.size} key initiatives).`, 'success');
        
        return {
            synced: syncedCount,
            keyInitiatives: keyInitiativeKeys.size
        };
        
    } catch (error) {
        console.error('JIRA sync failed:', error);
        let errorMsg = 'Failed: ' + error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMsg += ' (Is proxy.js running on port 8080?)';
        }
        onProgress(errorMsg, 'error');
        throw error;
    }
}

// Export all functions
export {
    getJiraCredentials,
    saveJiraCredentials,
    clearJiraCredentials,
    syncFromJira,
    mergeInitiativeData
};
