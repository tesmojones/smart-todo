#!/usr/bin/env node

/**
 * Cron script to send WhatsApp notifications for tasks due today
 * Runs daily at 06:00 AM to notify users about their due tasks
 * Uses WAHA (WhatsApp HTTP API) for sending messages
 */

const { Client } = require('pg');
const axios = require('axios');
require('dotenv').config({ path: '../server-new/.env' });



// Database configuration using DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

// WAHA API Configuration
const WAHA_CONFIG = {
  baseUrl: process.env.WAHA_BASE_URL || 'http://localhost:3000', // WAHA server URL
  session: process.env.WAHA_SESSION || 'default', // WhatsApp session name
  apiKey: process.env.WAHA_API_KEY || '', // Optional API key if WAHA requires authentication
};

// WhatsApp phone numbers mapping (you can configure this based on user emails or IDs)
// Format: { 'user@email.com': '+1234567890' }
const WHATSAPP_NUMBERS = {
  // Add user email to WhatsApp number mappings here
  // Example: 'john@example.com': '+1234567890'
  // Add your email and phone number mapping:
  // 'your-email@example.com': '+628125999849'
};

/**
 * Send WhatsApp message using WAHA API
 * @param {string} phoneNumber - WhatsApp number (with country code)
 * @param {string} message - Message to send
 * @returns {Promise<boolean>} - Success status
 */
async function sendWhatsAppMessage(phoneNumber, message) {
  const wahaBaseUrl = process.env.WAHA_BASE_URL || 'http://localhost:3000';
  const wahaSession = process.env.WAHA_SESSION || 'default';
  const wahaApiKey = process.env.WAHA_API_KEY || '';
  
  // Format phone number: remove '+' and any spaces/dashes, then add @c.us
  const cleanPhoneNumber = phoneNumber.replace(/[+\s-]/g, '');
  
  const data = {
    session: wahaSession,
    chatId: `${cleanPhoneNumber}@c.us`,
    text: message
  };

  const url = `${wahaBaseUrl}/api/sendText`;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add API key if provided
  if (wahaApiKey) {
    headers['X-Api-Key'] = wahaApiKey;
  }
  
  try {
    const response = await axios.post(url, data, {
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✓ WhatsApp message sent to ${phoneNumber}`);
      return true;
    } else {
      console.error(`✗ Failed to send WhatsApp message to ${phoneNumber}:`, response.status, response.data);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error sending WhatsApp message to ${phoneNumber}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

/**
 * Format task priority with emoji
 * @param {string} priority - Task priority
 * @returns {string} - Formatted priority with emoji
 */
function formatPriority(priority) {
  const priorityMap = {
    'low': '🟢 Low',
    'medium': '🟡 Medium',
    'high': '🟠 High',
    'urgent': '🔴 Urgent'
  };
  return priorityMap[priority] || priority;
}

/**
 * Format task status with emoji
 * @param {string} status - Task status
 * @returns {string} - Formatted status with emoji
 */
function formatStatus(status) {
  const statusMap = {
    'not_started': '⭕ Not Started',
    'in_progress': '🔄 In Progress',
    'completed': '✅ Completed'
  };
  return statusMap[status] || status;
}

/**
 * Create WhatsApp message for user's due tasks
 * @param {string} userName - User's name
 * @param {Array} tasks - Array of due tasks
 * @returns {string} - Formatted WhatsApp message
 */
function createTaskMessage(userName, tasks) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `🌅 Good morning, ${userName}!\n\n`;
  message += `📅 *Tasks Due Today* (${today})\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (tasks.length === 0) {
    message += `🎉 Great news! You have no tasks due today.\n`;
    message += `Enjoy your day! 😊`;
    return message;
  }

  tasks.forEach((task, index) => {
    message += `${index + 1}. *${task.title}*\n`;
    message += `   ${formatPriority(task.priority)} | ${formatStatus(task.status)}\n`;
    
    if (task.tags && task.tags.length > 0) {
      message += `   🏷️ ${task.tags.map(tag => `#${tag}`).join(' ')}\n`;
    }
    
    message += `\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💪 You've got this! Have a productive day!\n\n`;
  message += `_Sent by AI Todo Assistant_ 🤖`;

  return message;
}

/**
 * Main function to send daily WhatsApp notifications
 */
async function sendDailyNotifications() {
  try {
    console.log(`[${new Date().toISOString()}] Starting daily WhatsApp notifications...`);
    
    await client.connect();
    console.log('✓ Connected to database');

    // Get today's date range (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Looking for tasks due today: ${today.toISOString()} to ${todayEnd.toISOString()}`);

    // Query to find all users with tasks due today
    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        t.id as task_id,
        t.title,
        t.priority,
        t.status,
        t.tags,
        t.due_date
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      WHERE 
        t.due_date >= $1 
        AND t.due_date <= $2
        AND t.status != 'completed'
      ORDER BY u.id, t.priority DESC, t.created_at ASC
    `;

    const result = await client.query(query, [today, todayEnd]);
    console.log(`📋 Found ${result.rows.length} due tasks`);

    if (result.rows.length === 0) {
      console.log('ℹ️  No tasks due today. No notifications to send.');
      return;
    }

    // Group tasks by user
    const userTasks = {};
    result.rows.forEach(row => {
      if (!userTasks[row.user_id]) {
        userTasks[row.user_id] = {
          name: row.user_name,
          email: row.user_email,
          tasks: []
        };
      }
      
      if (row.task_id) { // Only add if task exists
        userTasks[row.user_id].tasks.push({
          id: row.task_id,
          title: row.title,
          priority: row.priority,
          status: row.status,
          tags: row.tags || [],
          dueDate: row.due_date
        });
      }
    });

    console.log(`👥 Processing notifications for ${Object.keys(userTasks).length} users`);

    // Send notifications to each user
    let successCount = 0;
    let failureCount = 0;

    for (const [userId, userData] of Object.entries(userTasks)) {
      try {
        // Get WhatsApp number for user (you may need to modify this logic)
        const whatsappNumber = WHATSAPP_NUMBERS[userData.email];
        
        if (!whatsappNumber) {
          console.log(`⚠️  No WhatsApp number configured for user: ${userData.email}`);
          failureCount++;
          continue;
        }

        // Create and send message
        const message = createTaskMessage(userData.name, userData.tasks);
        const success = await sendWhatsAppMessage(whatsappNumber, message);
        
        if (success) {
          successCount++;
          console.log(`✅ Notification sent to ${userData.name} (${userData.tasks.length} tasks)`);
        } else {
          failureCount++;
          console.log(`❌ Failed to send notification to ${userData.name}`);
        }

        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing user ${userData.name}:`, error.message);
        failureCount++;
      }
    }

    console.log('\n📊 Notification Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📱 Total users processed: ${Object.keys(userTasks).length}`);
    
  } catch (error) {
    console.error('❌ Error in daily notifications:', error);
    throw error;
  } finally {
    try {
      await client.end();
      console.log('✓ Database connection closed');
    } catch (error) {
      console.error('⚠️  Error closing database connection:', error.message);
    }
  }
}

// Run the script if executed directly
if (require.main === module) {
  sendDailyNotifications()
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await client.end();
      } catch (error) {
        // Ignore connection close errors
      }
    });
}

// Export functions for testing
module.exports = { sendWhatsAppMessage, createTaskMessage, main: sendDailyNotifications };