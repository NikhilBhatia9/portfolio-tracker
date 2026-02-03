/**
 * Utility Functions Module
 * Contains reusable helper functions
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Date object or null
 */
export function parseDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString);
}

/**
 * Calculate days difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Number of days
 */
export function daysDifference(date1, date2) {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
}

/**
 * Check if date is within N days from now
 * @param {Date|string} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean} True if within range
 */
export function isWithinDays(date, days) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    return d >= today && d <= future;
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize HTML string
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Show notification (browser notification if permitted, otherwise alert)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} options - Additional options
 */
export function showNotification(title, body, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, ...options });
    } else {
        console.log(`Notification: ${title} - ${body}`);
    }
}

/**
 * Request notification permission
 * @returns {Promise<string>} Permission result
 */
export async function requestNotificationPermission() {
    if ('Notification' in window) {
        return await Notification.requestPermission();
    }
    return 'denied';
}
