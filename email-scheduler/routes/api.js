/**
 * API Routes
 * Defines API endpoints for the email scheduler service
 */

const emailService = require('../services/email-service');

/**
 * Export data endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function exportData(req, res) {
    try {
        const { initiatives, summary, email } = req.body;

        // Validate input
        if (!initiatives || !Array.isArray(initiatives)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid data: initiatives array required' 
            });
        }
        
        if (initiatives.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data: initiatives array cannot be empty'
            });
        }
        
        // Validate initiative structure
        for (const initiative of initiatives) {
            if (!initiative.name || !initiative.status) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid data: each initiative must have name and status'
                });
            }
        }

        // Log data to console (always in development mode)
        emailService.logPortfolioData(initiatives, summary, email);

        // Generate email content
        const emailContent = emailService.generateEmailContent(initiatives, summary);

        // In production with transporter, would send actual email here
        // For now, just simulate success
        res.json({ 
            success: true, 
            message: 'Data received and logged. Configure SMTP settings to send actual emails.',
            receivedCount: initiatives.length 
        });

    } catch (error) {
        console.error('❌ Error processing export:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * Health check endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function healthCheck(req, res) {
    res.json({ 
        status: 'healthy', 
        service: 'email-scheduler',
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    exportData,
    healthCheck
};
