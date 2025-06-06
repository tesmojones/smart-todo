#!/bin/bash

# Setup script for WhatsApp daily notifications cron job
# This script configures the cron job to run daily at 06:00 AM

set -e

echo "🚀 Setting up WhatsApp Daily Notifications Cron Job"
echo "================================================="

# Get the current directory (scripts folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Scripts directory: $SCRIPT_DIR"

# Check if the notification script exists
if [ ! -f "$SCRIPT_DIR/whatsapp-daily-notifications.js" ]; then
    echo "❌ Error: whatsapp-daily-notifications.js not found in $SCRIPT_DIR"
    exit 1
fi

# Make the script executable
chmod +x "$SCRIPT_DIR/whatsapp-daily-notifications.js"
echo "✅ Made notification script executable"

# Create logs directory if it doesn't exist
LOGS_DIR="$SCRIPT_DIR/logs"
if [ ! -d "$LOGS_DIR" ]; then
    mkdir -p "$LOGS_DIR"
    echo "📁 Created logs directory: $LOGS_DIR"
fi

# Create the cron job entry
CRON_COMMAND="0 6 * * * cd $SCRIPT_DIR && node whatsapp-daily-notifications.js >> logs/whatsapp-notifications.log 2>&1"

echo "📋 Cron job command:"
echo "   $CRON_COMMAND"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "whatsapp-daily-notifications.js"; then
    echo "⚠️  WhatsApp notifications cron job already exists"
    echo "📝 Current cron jobs:"
    crontab -l | grep "whatsapp-daily-notifications.js" || true
    echo ""
    read -p "Do you want to replace the existing cron job? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
    
    # Remove existing cron job
    crontab -l | grep -v "whatsapp-daily-notifications.js" | crontab -
    echo "🗑️  Removed existing cron job"
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
echo "✅ Added WhatsApp notifications cron job"

# Verify the cron job was added
echo "📋 Current cron jobs:"
crontab -l | grep "whatsapp-daily-notifications.js" || echo "❌ Cron job not found!"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📅 Schedule: Daily at 06:00 AM"
echo "📝 Logs: $LOGS_DIR/whatsapp-notifications.log"
echo "🔧 Script: $SCRIPT_DIR/whatsapp-daily-notifications.js"
echo ""
echo "⚙️  Next steps:"
echo "   1. Configure WAHA API settings in your .env file:"
echo "      - WAHA_BASE_URL=http://127.0.0.1:3000"
echo "      - WAHA_SESSION=default"
echo "      - WAHA_API_KEY=your_api_key (optional)"
echo ""
echo "   2. Configure WhatsApp numbers in the script:"
echo "      Edit WHATSAPP_NUMBERS object in whatsapp-daily-notifications.js"
echo ""
echo "   3. Test the script manually:"
echo "      cd $SCRIPT_DIR && node whatsapp-daily-notifications.js"
echo ""
echo "   4. Monitor logs:"
echo "      tail -f $LOGS_DIR/whatsapp-notifications.log"
echo ""
echo "📱 Make sure WAHA (WhatsApp HTTP API) is running before the first execution!"