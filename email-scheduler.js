const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure email transporter (using ethereal for testing, configure with real SMTP for production)
let transporter = null;

async function setupTransporter() {
  // For testing purposes, we'll use console logging
  // In production, configure with real SMTP settings
  console.log('📧 Email transporter setup (using console logging for development)');
  console.log('⚠️  To use real email, configure SMTP settings in environment variables');
}

// API endpoint to receive data from the portfolio tracker
app.post('/api/export-data', async (req, res) => {
  try {
    const { initiatives, summary, email } = req.body;

    if (!initiatives || !Array.isArray(initiatives)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data: initiatives array required' 
      });
    }

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

    // In a production environment, you would send an actual email here
    // Example email content generation:
    const emailContent = generateEmailContent(initiatives, summary);
    console.log('📧 Email Content Preview:');
    console.log(emailContent);

    // Simulate email sending success
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
});

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'email-scheduler' });
});

// Start server
app.listen(PORT, async () => {
  await setupTransporter();
  console.log('\n🚀 Email Scheduler Service Started');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`📥 API endpoint: http://localhost:${PORT}/api/export-data`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════\n');
  console.log('Waiting for data from Portfolio Tracker...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down email scheduler service...');
  process.exit(0);
});
