#!/bin/bash

# Setup cron job for copying repetitive tasks
# This script adds a cron job that runs daily at 00:05

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NODE_PATH="$(which node)"
SCRIPT_PATH="$SCRIPT_DIR/copy-repetitive-tasks.js"
LOG_PATH="$SCRIPT_DIR/logs/copy-tasks.log"

echo "Setting up cron job for repetitive task copying..."
echo "Script directory: $SCRIPT_DIR"
echo "Node path: $NODE_PATH"
echo "Script path: $SCRIPT_PATH"
echo "Log path: $LOG_PATH"

# Create logs directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/logs"

# Check if Node.js is available
if [ ! -f "$NODE_PATH" ]; then
    echo "Error: Node.js not found at $NODE_PATH"
    echo "Please ensure Node.js is installed and in your PATH"
    exit 1
fi

# Check if the script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "Error: Script not found at $SCRIPT_PATH"
    exit 1
fi

# Install dependencies if needed
echo "Installing script dependencies..."
cd "$SCRIPT_DIR"
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Create the cron job entry
CRON_JOB="5 0 * * * cd $SCRIPT_DIR && $NODE_PATH $SCRIPT_PATH >> $LOG_PATH 2>&1"

echo "Cron job to be added:"
echo "$CRON_JOB"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "copy-repetitive-tasks.js"; then
    echo "Cron job for copy-repetitive-tasks.js already exists."
    echo "Current crontab:"
    crontab -l | grep "copy-repetitive-tasks.js"
    echo ""
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cron job setup cancelled."
        exit 0
    fi
    
    # Remove existing cron job
    crontab -l | grep -v "copy-repetitive-tasks.js" | crontab -
    echo "Existing cron job removed."
fi

# Add the new cron job
echo "Adding new cron job..."
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo "✓ Cron job added successfully!"
    echo ""
    echo "The script will now run daily at 00:05 (12:05 AM)"
    echo "Logs will be written to: $LOG_PATH"
    echo ""
    echo "Current crontab:"
    crontab -l
    echo ""
    echo "To remove this cron job later, run:"
    echo "crontab -e"
    echo "Or use: crontab -l | grep -v 'copy-repetitive-tasks.js' | crontab -"
else
    echo "✗ Failed to add cron job"
    exit 1
fi

echo ""
echo "Setup completed! The repetitive task copying will start tomorrow at 00:05."
echo "You can test the script manually by running:"
echo "cd $SCRIPT_DIR && npm run copy-tasks"