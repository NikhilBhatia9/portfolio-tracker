# Portfolio Tracker

A web-based portfolio tracking application with email scheduling capabilities.

## Features

- Track initiatives with status, timelines, and progress
- Export data for email notifications
- Email scheduler service for automated reporting

## Email Scheduler Service

The email scheduler service is a Node.js application that receives portfolio data from the tracker and can send automated email summaries.

### Running the Email Scheduler

#### Command to run the email scheduler:

```bash
npm run scheduler
```

Or alternatively:

```bash
npm start
```

Or directly with Node:

```bash
node email-scheduler.js
```

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Email Scheduler Service**
   ```bash
   npm run scheduler
   ```

3. **Verify Service is Running**
   - The service should start on `http://localhost:3001`
   - You should see a message: `🚀 Email Scheduler Service Started`
   - Open the portfolio tracker in your browser and use the "Export for Email" button

### Configuration

The email scheduler runs on port 3001 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm run scheduler
```

### Development Mode

For development, the service logs all received data to the console instead of sending actual emails.

To configure real email sending in production:
1. Set up SMTP credentials in environment variables
2. Update the transporter configuration in `email-scheduler.js`

### API Endpoints

- `POST /api/export-data` - Receives portfolio data for email generation
- `GET /health` - Health check endpoint

### Troubleshooting

If you see "Email scheduler service not available" error in the portfolio tracker:
1. Ensure the email scheduler is running (`npm run scheduler`)
2. Check that it's running on port 3001
3. Verify no firewall is blocking the connection

## Portfolio Tracker Usage

1. Open `index.html` in a web browser
2. Add and manage your initiatives
3. Use the "Export for Email" button to send data to the email scheduler service

## License

MIT
