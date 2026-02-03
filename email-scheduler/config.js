/**
 * Email Scheduler Configuration
 */

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3001,
    
    // SMTP Configuration (uncomment and configure for production)
    smtp: {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
        }
    },
    
    // Email Templates
    emailTemplates: {
        subject: 'Portfolio Tracker - Weekly Summary',
        from: process.env.EMAIL_FROM || 'noreply@portfolio-tracker.com'
    },
    
    // Feature Flags
    enableRealEmail: process.env.ENABLE_REAL_EMAIL === 'true'
};
