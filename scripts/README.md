# AI Todo - Cron Scripts

This directory contains cron scripts for automated tasks in the AI Todo application.

## Scripts Overview

### `copy-repetitive-tasks.js`
A Node.js script that copies incomplete repetitive tasks from the previous day to today.

**What it does:**
- Runs daily at 00:05 (12:05 AM)
- Finds tasks from the previous day where:
  - `is_repetitive = true`
  - `status != 'completed'`
- Creates new copies of these tasks for today
- Adjusts due dates if they were set for yesterday
- Maintains proper task ordering

**Features:**
- Automatic due date adjustment
- Proper task positioning
- Comprehensive logging
- Error handling and recovery
- Database connection management

## Setup Instructions

### 1. Install Dependencies
```bash
cd /Users/tesmo/Sites/aitodo/scripts
npm install
```

### 2. Configure Environment
Ensure your `.env` file in `server-new` directory contains:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=aitodo
```

### 3. Set Up Cron Job
Run the setup script to automatically configure the cron job:
```bash
./setup-cron.sh
```

This will:
- Install script dependencies
- Add a cron job that runs daily at 00:05
- Create a logs directory
- Set up proper logging

### 4. Manual Testing
Test the script manually before the cron job runs:
```bash
cd /Users/tesmo/Sites/aitodo/scripts
npm run copy-tasks
```

## Cron Job Details

**Schedule:** `5 0 * * *` (Daily at 00:05)
**Command:** `cd /path/to/scripts && node copy-repetitive-tasks.js >> logs/copy-tasks.log 2>&1`

## Logs

Logs are written to `logs/copy-tasks.log` and include:
- Execution timestamps
- Number of tasks found and copied
- Individual task copy results
- Error messages and stack traces
- Database connection status

## Monitoring

### Check Cron Job Status
```bash
# View current crontab
crontab -l

# Check recent logs
tail -f /Users/tesmo/Sites/aitodo/scripts/logs/copy-tasks.log

# Check last 50 lines of logs
tail -n 50 /Users/tesmo/Sites/aitodo/scripts/logs/copy-tasks.log
```

### Verify Script Execution
```bash
# Check if cron service is running (macOS)
sudo launchctl list | grep cron

# View system cron logs (macOS)
log show --predicate 'process == "cron"' --last 1d
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Cron Job Not Running**
   - Check if cron service is active: `sudo launchctl list | grep cron`
   - Verify cron job exists: `crontab -l`
   - Check system logs for cron errors

3. **Permission Denied**
   - Ensure script has execute permissions: `chmod +x copy-repetitive-tasks.js`
   - Check file ownership and permissions

4. **Node.js Not Found**
   - Use full path to node in cron job
   - Check node installation: `which node`

5. **Environment Variables Not Loaded**
   - Ensure `.env` file path is correct
   - Check file permissions on `.env`
   - Verify environment variable names

### Debug Mode
Run the script with additional logging:
```bash
NODE_ENV=development node copy-repetitive-tasks.js
```

## Maintenance

### Remove Cron Job
```bash
# Remove the specific cron job
crontab -l | grep -v 'copy-repetitive-tasks.js' | crontab -

# Or edit crontab manually
crontab -e
```

### Update Script
1. Modify the script file
2. Test manually: `npm run copy-tasks`
3. No need to update cron job unless schedule changes

### Log Rotation
Consider setting up log rotation to prevent log files from growing too large:
```bash
# Add to cron job for weekly log rotation
0 0 * * 0 cd /Users/tesmo/Sites/aitodo/scripts && mv logs/copy-tasks.log logs/copy-tasks.log.$(date +\%Y\%m\%d) && touch logs/copy-tasks.log
```

## Security Considerations

- Database credentials are stored in `.env` file
- Ensure `.env` file has restricted permissions (600)
- Log files may contain sensitive information
- Consider encrypting database connection if running over network

## Performance Notes

- Script processes tasks in batches for efficiency
- Database queries are optimized with proper indexing
- Execution time scales with number of repetitive tasks
- Typical execution time: < 5 seconds for 100 tasks

---

**Note:** This script is designed for the AI Todo application's specific database schema. Ensure your database structure matches the expected format before running.