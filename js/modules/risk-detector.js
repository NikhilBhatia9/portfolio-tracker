/**
 * Risk Detection Module
 * Automatically detects and reports risks based on phase deadlines
 */

import { saveInitiative } from './database.js';
import { getInitiatives } from './state.js';
import { showNotification } from './utils.js';

// Risk detection configuration
const APPROACHING_DEADLINE_DAYS = 5;
const RISK_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Detect risks in initiatives based on phase deadlines
 * @param {Array} initiatives - Array of initiatives
 * @returns {Object} Risk detection result
 */
function detectRisks(initiatives) {
    const now = new Date();
    const approachingDeadline = new Date(now.getTime() + (APPROACHING_DEADLINE_DAYS * 24 * 60 * 60 * 1000));
    
    let autoUpdatedCount = 0;
    let warnings = [];
    
    initiatives.forEach(initiative => {
        if (!initiative.phases || initiative.phases.length === 0) return;
        
        let hasOverduePhase = false;
        let hasApproachingDeadline = false;
        let overduePhases = [];
        let approachingPhases = [];
        
        initiative.phases.forEach(phase => {
            const endDate = new Date(phase.endDate);
            
            // Check if phase is overdue (past end date and not completed)
            if (endDate < now && phase.status !== 'completed') {
                hasOverduePhase = true;
                const daysOverdue = Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
                overduePhases.push({
                    name: phase.name,
                    endDate: phase.endDate,
                    daysOverdue: daysOverdue
                });
            }
            
            // Check if deadline is approaching (within threshold and not completed)
            if (endDate >= now && endDate <= approachingDeadline && phase.status !== 'completed') {
                hasApproachingDeadline = true;
                const daysUntil = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                approachingPhases.push({
                    name: phase.name,
                    endDate: phase.endDate,
                    daysUntil: daysUntil
                });
            }
        });
        
        // Auto-update to "Risk" status if has overdue phases
        if (hasOverduePhase && initiative.status !== 'Risk' && initiative.status !== 'Completed') {
            initiative.status = 'Risk';
            initiative._autoRisk = true; // Mark as auto-updated
            autoUpdatedCount++;
        }
        
        // Store risk info for display
        if (hasOverduePhase || hasApproachingDeadline) {
            initiative._riskInfo = {
                hasOverduePhase,
                hasApproachingDeadline,
                overduePhases,
                approachingPhases
            };
            
            warnings.push({
                initiative: initiative,
                overduePhases: overduePhases,
                approachingPhases: approachingPhases
            });
        } else {
            delete initiative._riskInfo;
        }
    });
    
    return {
        autoUpdatedCount,
        warnings
    };
}

/**
 * Save auto-detected risks to database
 * @param {Array} initiatives - Array of initiatives
 * @returns {Promise<Object>} Risk detection result
 */
async function saveRiskDetection(initiatives) {
    const result = detectRisks(initiatives);
    
    if (result.autoUpdatedCount > 0) {
        // Save all initiatives that were auto-updated to risk
        for (const initiative of initiatives) {
            if (initiative._autoRisk) {
                try {
                    await saveInitiative(initiative);
                    delete initiative._autoRisk; // Clean up marker
                } catch (error) {
                    console.error(`Failed to save risk status for ${initiative.id}:`, error);
                }
            }
        }
        
        console.log(`⚠️ Auto-updated ${result.autoUpdatedCount} initiatives to "At Risk" status`);
    }
    
    return result;
}

/**
 * Show risk notifications to user
 * @param {Array} warnings - Array of warning objects
 */
function showRiskNotifications(warnings) {
    if (warnings.length === 0) return;
    
    let overdueCount = warnings.filter(w => w.overduePhases.length > 0).length;
    let approachingCount = warnings.filter(w => w.approachingPhases.length > 0).length;
    
    if (overdueCount > 0 || approachingCount > 0) {
        let message = '⚠️ DEADLINE ALERTS:\n\n';
        
        if (overdueCount > 0) {
            message += `🚨 ${overdueCount} initiative(s) with OVERDUE phases\n`;
        }
        if (approachingCount > 0) {
            message += `⏰ ${approachingCount} initiative(s) with deadlines in next ${APPROACHING_DEADLINE_DAYS} days\n`;
        }
        
        message += '\nCheck Dashboard for details.';
        
        // Show notification
        showNotification('Portfolio Tracker Alert', message, {
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>⚠️</text></svg>"
        });
        
        console.warn(message);
    }
}

/**
 * Add risk indicators to timeline bars
 * @param {HTMLElement} container - Timeline container element
 */
function addTimelineRiskIndicators(container) {
    if (!container) return;
    
    const now = new Date();
    const approachingDeadline = new Date(now.getTime() + (APPROACHING_DEADLINE_DAYS * 24 * 60 * 60 * 1000));
    
    container.querySelectorAll('.timeline-bar').forEach(bar => {
        // Skip if no phase data
        if (!bar.dataset.phaseEndDate) return;
        
        const phaseStatus = bar.dataset.phaseStatus;
        const endDate = new Date(bar.dataset.phaseEndDate);
        const phaseName = bar.dataset.phaseName || bar.textContent.trim();
        
        // Only flag phases that are NOT completed
        const isNotCompleted = phaseStatus !== 'completed';
        
        // Add warning indicator for overdue phases
        if (endDate < now && isNotCompleted) {
            bar.style.border = '2px solid #ef4444';
            bar.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
            bar.style.position = 'relative';
            bar.style.animation = 'pulse 2s infinite';
            
            const daysOverdue = Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
            
            const badge = document.createElement('div');
            badge.textContent = '🚨';
            badge.title = `OVERDUE by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}! Phase: ${phaseName}`;
            badge.style.cssText = `
                position: absolute;
                right: 4px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8rem;
                z-index: 10;
                cursor: help;
            `;
            bar.appendChild(badge);
            
            console.log(`⚠️ OVERDUE PHASE: "${phaseName}" - ${daysOverdue} days overdue`);
        }
        // Add warning for approaching deadline
        else if (endDate <= approachingDeadline && isNotCompleted) {
            bar.style.border = '2px solid #f59e0b';
            bar.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.4)';
            bar.style.position = 'relative';
            
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            
            const badge = document.createElement('div');
            badge.textContent = '⏰';
            badge.title = `Due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}! Phase: ${phaseName}`;
            badge.style.cssText = `
                position: absolute;
                right: 4px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8rem;
                z-index: 10;
                cursor: help;
            `;
            bar.appendChild(badge);
            
            console.log(`⏰ APPROACHING DEADLINE: "${phaseName}" - ${daysRemaining} days remaining`);
        }
    });
}

/**
 * Get risk summary for an initiative
 * @param {Object} initiative - Initiative object
 * @returns {Object|null} Risk summary or null
 */
function getRiskSummary(initiative) {
    if (!initiative._riskInfo) return null;
    
    return {
        hasOverduePhase: initiative._riskInfo.hasOverduePhase,
        hasApproachingDeadline: initiative._riskInfo.hasApproachingDeadline,
        overdueCount: initiative._riskInfo.overduePhases.length,
        approachingCount: initiative._riskInfo.approachingPhases.length,
        overduePhases: initiative._riskInfo.overduePhases,
        approachingPhases: initiative._riskInfo.approachingPhases
    };
}

/**
 * Start periodic risk detection
 * @param {Function} onRisksDetected - Callback when risks are detected
 * @returns {number} Interval ID
 */
function startRiskDetection(onRisksDetected) {
    // Run immediately
    (async () => {
        const initiatives = getInitiatives();
        const result = await saveRiskDetection(initiatives);
        showRiskNotifications(result.warnings);
        if (onRisksDetected) onRisksDetected(result);
    })();
    
    // Run periodically
    return setInterval(async () => {
        const initiatives = getInitiatives();
        const result = await saveRiskDetection(initiatives);
        showRiskNotifications(result.warnings);
        if (onRisksDetected) onRisksDetected(result);
    }, RISK_CHECK_INTERVAL);
}

/**
 * Stop risk detection
 * @param {number} intervalId - Interval ID from startRiskDetection
 */
function stopRiskDetection(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
    }
}

// Export all functions
export {
    detectRisks,
    saveRiskDetection,
    showRiskNotifications,
    addTimelineRiskIndicators,
    getRiskSummary,
    startRiskDetection,
    stopRiskDetection,
    APPROACHING_DEADLINE_DAYS
};
