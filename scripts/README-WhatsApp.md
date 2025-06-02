# WhatsApp Daily Notifications Setup

This guide explains how to set up daily WhatsApp notifications for tasks due today using the WAHA (WhatsApp HTTP API).

## Overview

The WhatsApp notification system consists of:
- **Main Script**: `whatsapp-daily-notifications.js` - Sends daily notifications at 6:00 AM
- **Test Script**: `test-whatsapp-notifications.js` - Tests the notification system
- **Setup Script**: `setup-whatsapp-cron.sh` - Configures the cron job

## Prerequisites

1. **WAHA (WhatsApp HTTP API)** running and accessible
2. **PostgreSQL database** with tasks and users tables
3. **Node.js** and npm installed
4. **Environment variables** configured

## Installation

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Configure Environment Variables

Add these variables to your `.env` file in the `server-new` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/aitodo

# WAHA Configuration
WAHA_BASE_URL=http://localhost:3000
WAHA_SESSION=default
WAHA_API_KEY=your_api_key_here

# Optional: Test phone number
TEST_WHATSAPP_NUMBER=+1234567890
```

### 3. Configure WhatsApp Numbers

Edit the `WHATSAPP_NUMBERS` object in `whatsapp-daily-notifications.js`:

```javascript
const WHATSAPP_NUMBERS = {
  'user1@example.com': '+1234567890',
  'user2@example.com': '+0987654321',
  // Add more user email to phone number mappings
};
```

## Testing

### Run the Test Suite

```bash
npm run test-whatsapp
```

The test suite will check:
- ✅ Database connection and schema
- ✅ WAHA API configuration and availability
- ✅ Message formatting
- ✅ Task query for today's due tasks
- ✅ WhatsApp message sending (if test number configured)

### Manual Testing

```bash
# Test the notification script manually
npm run whatsapp-notify

# Or run directly
node whatsapp-daily-notifications.js
```

## Setup Cron Job

### Automatic Setup

```bash
# Make the setup script executable
chmod +x setup-whatsapp-cron.sh

# Run the setup script
./setup-whatsapp-cron.sh
```

### Manual Setup

```bash
# Open crontab
crontab -e

# Add this line for daily 6:00 AM notifications
0 6 * * * cd /Users/tesmo/Sites/aitodo/scripts && /usr/local/bin/node whatsapp-daily-notifications.js >> logs/whatsapp-notifications.log 2>&1
```

## Monitoring

### View Logs

```bash
# View recent logs
tail -f logs/whatsapp-notifications.log

# View all logs
cat logs/whatsapp-notifications.log
```

### Check Cron Job Status

```bash
# List current cron jobs
crontab -l

# Check if cron service is running
sudo launchctl list | grep cron
```

## Message Format

The WhatsApp messages are formatted as follows:

```
🌅 Good morning, John!

You have 3 tasks due today:

🔴 HIGH: Complete project proposal
   📋 Status: in_progress
   🏷️ Tags: work, urgent

🟡 MEDIUM: Buy groceries
   📋 Status: not_started
   🏷️ Tags: personal, shopping

🟢 LOW: Call dentist for appointment
   📋 Status: not_started
   🏷️ Tags: health

Have a productive day! 💪
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **WAHA API Not Reachable**
   - Check `WAHA_BASE_URL` in `.env`
   - Ensure WAHA service is running
   - Verify network connectivity

3. **No Tasks Found**
   - Check if tasks have `due_date` set
   - Verify tasks are not marked as `completed`
   - Check date/time formatting

4. **WhatsApp Message Not Sent**
   - Verify phone number format (+1234567890)
   - Check WAHA session status
   - Ensure WhatsApp is connected in WAHA

5. **Cron Job Not Running**
   - Check cron service: `sudo launchctl list | grep cron`
   - Verify cron job syntax: `crontab -l`
   - Check file permissions and paths

### Debug Mode

Run with debug output:

```bash
DEBUG=1 node whatsapp-daily-notifications.js
```

### Test Individual Components

```bash
# Test database connection only
node -e "require('./test-whatsapp-notifications').testDatabaseConnection()"

# Test WAHA API only
node -e "require('./test-whatsapp-notifications').testWAHAConfiguration()"
```

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `WAHA_BASE_URL` | `http://localhost:3000` | WAHA API base URL |
| `WAHA_SESSION` | `default` | WAHA session name |
| `WAHA_API_KEY` | - | WAHA API key (optional) |
| `TEST_WHATSAPP_NUMBER` | - | Phone number for testing |

### Script Configuration

Edit these variables in `whatsapp-daily-notifications.js`:

```javascript
// WhatsApp number mappings
const WHATSAPP_NUMBERS = {
  // email: phone_number
};

// Message customization
const PRIORITY_EMOJIS = {
  high: '🔴',
  medium: '🟡', 
  low: '🟢'
};
```

## Security Notes

- Never commit API keys or phone numbers to version control
- Use environment variables for sensitive configuration
- Restrict file permissions on scripts and logs
- Monitor logs for any security issues

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Run the test suite to identify specific problems
3. Review logs for error messages
4. Ensure all prerequisites are met