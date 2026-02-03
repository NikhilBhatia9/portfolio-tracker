# Portfolio Tracker

A web-based portfolio tracking application with email scheduling capabilities, built with modern best practices and modular architecture.

## 🏗️ Project Structure

The application has been refactored to follow best coding practices with a modular architecture:

```
portfolio-tracker/
├── index.html                      # Main HTML file
├── css/
│   └── styles.css                  # Extracted CSS styles
├── js/
│   └── modules/
│       ├── config.js               # Configuration constants
│       ├── database.js             # Database abstraction (Supabase + IndexedDB)
│       ├── state.js                # Application state management
│       ├── utils.js                # Utility functions
│       ├── jira-sync.js            # JIRA integration
│       └── risk-detector.js        # Risk detection and management
├── email-scheduler/
│   ├── config.js                   # Email scheduler configuration
│   ├── routes/
│   │   └── api.js                  # API route handlers
│   └── services/
│       └── email-service.js        # Email service logic
├── email-scheduler.js              # Original email scheduler (legacy)
└── email-scheduler-modular.js      # Refactored email scheduler
```

## ✨ Features

- Track initiatives with status, timelines, and progress
- Modular ES6 architecture for maintainability
- Dual database support (Supabase cloud + IndexedDB local)
- JIRA integration with intelligent data merging
- Automated risk detection based on deadlines
- Export data for email notifications
- Email scheduler service for automated reporting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser with ES6 module support
- (Optional) Supabase account for cloud storage
- (Optional) JIRA account for integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase (Optional)**
   - Update `js/modules/config.js` with your Supabase credentials
   - The app will fall back to local IndexedDB storage if not configured

4. **Configure JIRA (Optional)**
   - Use the Settings modal in the app to configure JIRA credentials
   - Requires a running CORS proxy (see JIRA Integration section)

## 📧 Email Scheduler Service

The email scheduler is a Node.js service that receives portfolio data and can send automated email summaries.

### Running the Email Scheduler

#### Using the Modular Version (Recommended)

```bash
npm run scheduler
# Or
node email-scheduler-modular.js
```

#### Using the Legacy Version

```bash
node email-scheduler.js
```

### Configuration

The email scheduler runs on port 3001 by default. Configure via environment variables:

```bash
PORT=8080 npm run scheduler
```

For production email sending, set these environment variables:

```bash
ENABLE_REAL_EMAIL=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@portfolio-tracker.com
```

### Development Mode

By default, the service logs all received data to the console instead of sending actual emails. This is perfect for development and testing.

### API Endpoints

- `POST /api/export-data` - Receives portfolio data for email generation
  ```json
  {
    "initiatives": [...],
    "summary": { "active": 5, "risk": 2, ... },
    "email": "recipient@example.com"
  }
  ```
- `GET /health` - Health check endpoint

## 🎯 Portfolio Tracker Usage

1. **Open the application**
   ```bash
   # Simply open index.html in a modern web browser
   # Or serve it with a local server:
   npx serve .
   ```

2. **Manage Initiatives**
   - Add, edit, and track your initiatives
   - Define phases with dates and milestones
   - Categorize and tag for better organization

3. **JIRA Integration**
   - Click Settings → Configure JIRA credentials
   - Sync initiatives from JIRA with intelligent merge

4. **Risk Detection**
   - Automatic detection of overdue phases
   - Visual indicators for approaching deadlines
   - Browser notifications for critical alerts

5. **Export Data**
   - Use "Export for Email" to send data to the scheduler service
   - Requires the email scheduler service to be running

## 🏛️ Architecture & Design

### Modular Design Principles

The codebase follows these best practices:

1. **Separation of Concerns** - Each module has a single, well-defined responsibility
2. **ES6 Modules** - Clean import/export system for dependencies
3. **Configuration Management** - Centralized configuration in config files
4. **Database Abstraction** - Single interface for both Supabase and IndexedDB
5. **Service Layer** - Business logic separated from presentation
6. **Error Handling** - Consistent error handling patterns
7. **Code Documentation** - JSDoc comments for all public functions

### Key Modules

- **config.js** - All configuration constants and settings
- **database.js** - CRUD operations with automatic backend selection
- **state.js** - Centralized state management with persistence
- **utils.js** - Reusable utility functions (date formatting, notifications, etc.)
- **jira-sync.js** - JIRA API integration with smart data merging
- **risk-detector.js** - Automated risk detection and alerting

### Email Scheduler Architecture

The email scheduler follows a layered architecture:

- **Routes Layer** (`routes/api.js`) - HTTP endpoint handlers
- **Service Layer** (`services/email-service.js`) - Business logic
- **Config Layer** (`config.js`) - Configuration management

## 🔧 Development

### Code Style

- Use ES6+ features (arrow functions, destructuring, async/await)
- Follow JSDoc conventions for documentation
- Keep functions small and focused (single responsibility)
- Use descriptive variable and function names

### Adding New Features

1. Identify the appropriate module or create a new one
2. Add JSDoc comments for all public functions
3. Export only what's needed (principle of least exposure)
4. Update this README with any new functionality

## 🐛 Troubleshooting

### Email Scheduler Issues

If you see "Email scheduler service not available" error:
1. Ensure the email scheduler is running (`npm run scheduler`)
2. Check that it's running on port 3001
3. Verify no firewall is blocking the connection

### Database Issues

- **Supabase not connecting**: Check credentials in `config.js`
- **Local storage**: App automatically falls back to IndexedDB
- **Migration**: Use the Settings modal to migrate data to Supabase

### JIRA Sync Issues

- Ensure the CORS proxy is running on port 8080
- Verify JIRA credentials and permissions
- Check JQL query syntax in Settings

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and documentation standards.

## 📚 Further Reading

- [Supabase Documentation](https://supabase.io/docs)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
