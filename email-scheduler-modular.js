/**
 * Email Scheduler Service
 * Modular version with clean separation of concerns
 */

const express = require('express');
const cors = require('cors');
const config = require('./email-scheduler/config');
const apiRoutes = require('./email-scheduler/routes/api');
const emailService = require('./email-scheduler/services/email-service');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup email transporter
const transporter = emailService.setupTransporter();

// API Routes
app.post('/api/export-data', apiRoutes.exportData);
app.get('/health', apiRoutes.healthCheck);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(config.port, () => {
    console.log('\n🚀 Email Scheduler Service Started');
    console.log('═══════════════════════════════════════');
    console.log(`📡 Server running on http://localhost:${config.port}`);
    console.log(`📥 API endpoint: http://localhost:${config.port}/api/export-data`);
    console.log(`💚 Health check: http://localhost:${config.port}/health`);
    console.log('═══════════════════════════════════════\n');
    console.log('Waiting for data from Portfolio Tracker...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Shutting down email scheduler service...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n📴 Shutting down email scheduler service...');
    process.exit(0);
});
