/**
 * Email Service
 * Handles email generation and sending
 */

const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Setup email transporter
 * @returns {Object|null} Transporter or null if disabled
 */
function setupTransporter() {
    if (!config.enableRealEmail) {
        console.log('📧 Email transporter setup (using console logging for development)');
        console.log('⚠️  To use real email, configure SMTP settings in environment variables');
        return null;
    }
    
    // Create transporter with SMTP settings
    const transporter = nodemailer.createTransport(config.smtp);
    console.log('📧 Email transporter configured with SMTP settings');
    return transporter;
}

/**
 * Generate email content from portfolio data
 * @param {Array} initiatives - Array of initiatives
 * @param {Object} summary - Summary statistics
 * @returns {string} Email content
 */
function generateEmailContent(initiatives, summary) {
    let content = '\n';
    content += '╔══════════════════════════════════════════╗\n';
    content += '║   Portfolio Tracker - Weekly Summary     ║\n';
    content += '╚══════════════════════════════════════════╝\n\n';

    if (summary) {
        content += '📊 Summary:\n';
        content += `  ✓ Active: ${summary.active || 0}\n`;
        content += `  ⚠ Risk: ${summary.risk || 0}\n`;
        content += `  📋 Planned: ${summary.planned || 0}\n`;
        content += `  ✅ Completed: ${summary.completed || 0}\n\n`;
    }

    content += '📋 Initiatives:\n';
    initiatives.forEach((initiative) => {
        const statusIcon = {
            'Active': '✓',
            'Risk': '⚠',
            'Planned': '📋',
            'Completed': '✅'
        }[initiative.status] || '•';
        
        content += `  ${statusIcon} ${initiative.name}\n`;
        if (initiative.targetDate) {
            content += `    Target: ${initiative.targetDate}\n`;
        }
    });

    content += '\n';
    return content;
}

/**
 * Log portfolio data to console (development mode)
 * @param {Array} initiatives - Array of initiatives
 * @param {Object} summary - Summary statistics
 * @param {string} email - Recipient email
 */
function logPortfolioData(initiatives, summary, email) {
    console.log('\n📊 Received Portfolio Data for Email:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Initiatives: ${initiatives.length}`);
    console.log(`Recipient Email: ${email || 'Not specified'}`);
    
    if (summary) {
        console.log('\n📈 Summary Statistics:');
        console.log(`  Active: ${summary.active || 0}`);
        console.log(`  Risk: ${summary.risk || 0}`);
        console.log(`  Planned: ${summary.planned || 0}`);
        console.log(`  Completed: ${summary.completed || 0}`);
    }

    console.log('\n📋 Initiatives:');
    initiatives.forEach((initiative, index) => {
        console.log(`  ${index + 1}. [${initiative.status}] ${initiative.name}`);
        if (initiative.targetDate) {
            console.log(`     Target: ${initiative.targetDate}`);
        }
    });
    console.log('═══════════════════════════════════════\n');
}

/**
 * Send email with portfolio data
 * @param {Object} transporter - Nodemailer transporter
 * @param {string} recipient - Recipient email address
 * @param {string} content - Email content
 * @returns {Promise<Object>} Send result
 */
async function sendEmail(transporter, recipient, content) {
    if (!transporter) {
        // Development mode - just log
        console.log('📧 Email Content Preview:');
        console.log(content);
        return { success: true, mode: 'development' };
    }
    
    // Production mode - actually send email
    const mailOptions = {
        from: config.emailTemplates.from,
        to: recipient,
        subject: config.emailTemplates.subject,
        text: content
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        throw error;
    }
}

module.exports = {
    setupTransporter,
    generateEmailContent,
    logPortfolioData,
    sendEmail
};
